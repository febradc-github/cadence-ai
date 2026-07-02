const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');

const SCRIPT_PATH = path.join(__dirname, 'brain-mcp.js');
const {
  parseLinks,
  parseTags,
  validName,
  loadBrain,
} = require('./brain-mcp.js');

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-fixture-'));
  const brain = path.join(root, 'cadence', 'brain');
  fs.mkdirSync(brain, { recursive: true });
  fs.writeFileSync(
    path.join(brain, 'api-auth.md'),
    '---\ntype: domain\ntags: [api, auth]\ncreated: 2026-07-01\nupdated: 2026-07-01\nrelated: ["[[jwt-tokens]]"]\nsources: []\n---\n\n# API auth\n\nUses [[jwt-tokens]] everywhere. Built for [[C-12]].\n'
  );
  fs.writeFileSync(
    path.join(brain, 'jwt-tokens.md'),
    '---\ntype: domain\ntags: [api]\ncreated: 2026-07-01\nupdated: 2026-07-01\nrelated: ["[[api-auth]]"]\nsources: []\n---\n\n# JWT tokens\n\nSee also: [[api-auth|the auth note]] and [[api-auth#Rotation]].\n'
  );
  fs.writeFileSync(
    path.join(brain, 'loose-note.md'),
    '---\ntype: process\ntags: [estimation]\ncreated: 2026-07-02\nupdated: 2026-07-02\nrelated: []\nsources: []\n---\n\n# Loose note\n\nNo links here.\n'
  );
  return { root, brain };
}

test('parseLinks handles plain, alias, and heading wikilinks, deduped', () => {
  assert.deepEqual(parseLinks('a [[x]] b [[x|alias]] c [[x#h]] d [[Y Z]]'), ['x', 'Y Z']);
});

test('parseTags reads the frontmatter tags line', () => {
  assert.deepEqual(parseTags('---\ntags: [api, auth]\n---\nbody #not-this'), ['api', 'auth']);
  assert.deepEqual(parseTags('no frontmatter'), []);
});

test('validName rejects path separators, dots, traversal', () => {
  assert.equal(validName('api-auth'), true);
  assert.equal(validName('C-12'), true);
  assert.equal(validName('a/b'), false);
  assert.equal(validName('a\\b'), false);
  assert.equal(validName('..'), false);
  assert.equal(validName('.hidden'), false);
  assert.equal(validName(''), false);
});

test('loadBrain returns null for a missing dir and parses notes otherwise', () => {
  assert.equal(loadBrain(path.join(os.tmpdir(), 'nope-' + Date.now())), null);
  const { brain } = makeFixture();
  const notes = loadBrain(brain);
  assert.deepEqual(notes.map((n) => n.name).sort(), ['api-auth', 'jwt-tokens', 'loose-note']);
  const auth = notes.find((n) => n.name === 'api-auth');
  assert.deepEqual(auth.links, ['jwt-tokens', 'C-12']);
  assert.deepEqual(auth.tags, ['api', 'auth']);
});
