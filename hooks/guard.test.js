const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const GUARD_PATH = path.join(__dirname, 'guard.js');

function runGuard(input) {
  return spawnSync('node', [GUARD_PATH], {
    input: JSON.stringify(input),
    encoding: 'utf8',
  });
}

function bashCommand(command) {
  return { tool_name: 'Bash', tool_input: { command } };
}

test('allows a normal git commit', () => {
  const result = runGuard(bashCommand('git commit -m "feat: add endpoint (C-12)"'));
  assert.equal(result.status, 0);
});

test('allows non-git and non-commit commands', () => {
  assert.equal(runGuard(bashCommand('npm test')).status, 0);
  assert.equal(runGuard(bashCommand('git status')).status, 0);
});

test('ignores non-shell tools', () => {
  const result = runGuard({ tool_name: 'Write', tool_input: { file_path: 'x' } });
  assert.equal(result.status, 0);
});

test('blocks violations coming through the PowerShell tool too', () => {
  const result = runGuard({
    tool_name: 'PowerShell',
    tool_input: { command: 'git commit --no-verify -m "fix: x (C-1)"' },
  });
  assert.equal(result.status, 2);
});

test('blocks git commit --no-verify', () => {
  const result = runGuard(bashCommand('git commit --no-verify -m "fix: x (C-1)"'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /--no-verify/);
});

test('blocks Claude co-author trailers', () => {
  const result = runGuard(
    bashCommand('git commit -m "fix: x (C-1)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"')
  );
  assert.equal(result.status, 2);
  assert.match(result.stderr, /attribution/);
});

test('blocks anthropic noreply addresses regardless of trailer wording', () => {
  const result = runGuard(bashCommand('git commit -m "x" --author="Bot <noreply@anthropic.com>"'));
  assert.equal(result.status, 2);
});

test('never blocks on unparseable input', () => {
  const result = spawnSync('node', [GUARD_PATH], { input: 'not json', encoding: 'utf8' });
  assert.equal(result.status, 0);
});
