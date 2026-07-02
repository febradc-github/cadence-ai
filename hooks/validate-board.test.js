const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const VALIDATOR_PATH = path.join(__dirname, 'validate-board.js');

function makeCadenceDir(files) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cadence-validate-test-'));
  const cadenceDir = path.join(tmpDir, 'cadence');
  fs.mkdirSync(cadenceDir);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(cadenceDir, name), content);
  }
  return cadenceDir;
}

function runValidator(filePath) {
  return spawnSync('node', [VALIDATOR_PATH], {
    input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: filePath } }),
    encoding: 'utf8',
  });
}

const GOOD_BACKLOG = `items:
  - id: C-1
    title: "First"
    status: idea
  - id: C-2
    title: "Second"
    status: ready
`;

const GOOD_SPRINT = `sprint:
  name: "Sprint 1"
  goal: "Ship it"
  status: active
items:
  - id: C-3
    title: "Third"
    status: in_progress
  - id: C-4
    title: "Fourth"
    status: todo
`;

test('passes a valid backlog and sprint', () => {
  const dir = makeCadenceDir({ 'backlog.yml': GOOD_BACKLOG, 'sprint-1.yml': GOOD_SPRINT });
  assert.equal(runValidator(path.join(dir, 'backlog.yml')).status, 0);
  assert.equal(runValidator(path.join(dir, 'sprint-1.yml')).status, 0);
});

test('ignores files outside cadence board paths', () => {
  const result = runValidator(path.join(os.tmpdir(), 'src', 'index.js'));
  assert.equal(result.status, 0);
});

test('rejects an invalid backlog status', () => {
  const dir = makeCadenceDir({
    'backlog.yml': 'items:\n  - id: C-1\n    status: in_progress\n',
  });
  const result = runValidator(path.join(dir, 'backlog.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /invalid status "in_progress"/);
});

test('rejects duplicate ids within a file', () => {
  const dir = makeCadenceDir({
    'backlog.yml': 'items:\n  - id: C-1\n    status: idea\n  - id: C-1\n    status: ready\n',
  });
  const result = runValidator(path.join(dir, 'backlog.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /duplicate id C-1/);
});

test('rejects two in_progress items in the active sprint', () => {
  const sprint = GOOD_SPRINT.replace('status: todo', 'status: in_progress');
  const dir = makeCadenceDir({ 'sprint-1.yml': sprint });
  const result = runValidator(path.join(dir, 'sprint-1.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /only one is allowed/);
});

test('rejects an id living in both backlog and the active sprint', () => {
  const sprint = GOOD_SPRINT.replace('id: C-3', 'id: C-1');
  const dir = makeCadenceDir({ 'backlog.yml': GOOD_BACKLOG, 'sprint-1.yml': sprint });
  const result = runValidator(path.join(dir, 'sprint-1.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /exactly one live copy/);
});

test('allows a completed sprint to keep historical copies', () => {
  const completed = GOOD_SPRINT.replace('status: active', 'status: completed').replace(
    'id: C-3',
    'id: C-1'
  );
  const dir = makeCadenceDir({ 'backlog.yml': GOOD_BACKLOG, 'sprint-1.yml': completed });
  assert.equal(runValidator(path.join(dir, 'backlog.yml')).status, 0);
});

test('rejects two active sprints', () => {
  const dir = makeCadenceDir({
    'sprint-1.yml': GOOD_SPRINT,
    'sprint-2.yml': GOOD_SPRINT.replace('id: C-3', 'id: C-5').replace('id: C-4', 'id: C-6'),
  });
  const result = runValidator(path.join(dir, 'sprint-2.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /multiple active sprints/);
});

test('rejects an invalid sprint status', () => {
  const dir = makeCadenceDir({ 'sprint-1.yml': GOOD_SPRINT.replace('status: active', 'status: open') });
  const result = runValidator(path.join(dir, 'sprint-1.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /sprint status "open" is invalid/);
});

test('rejects a malformed ticket id', () => {
  const dir = makeCadenceDir({ 'backlog.yml': 'items:\n  - id: TICKET-9\n    status: idea\n' });
  const result = runValidator(path.join(dir, 'backlog.yml'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /does not match C-<number>/);
});

test('never blocks on unparseable input', () => {
  const result = spawnSync('node', [VALIDATOR_PATH], { input: 'not json', encoding: 'utf8' });
  assert.equal(result.status, 0);
});
