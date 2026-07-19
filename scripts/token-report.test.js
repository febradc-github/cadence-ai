const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const REPORT_PATH = path.join(__dirname, 'token-report.js');

function runReport(args) {
  return execFileSync('node', [REPORT_PATH, ...args], { encoding: 'utf8' });
}

test('emits a JSON report with fixed, perTurn, invoked, capture, and totals', () => {
  const report = JSON.parse(runReport(['--turns', '30', '--json']));
  for (const key of ['fixed', 'perTurn', 'invoked', 'capture', 'totals']) {
    assert.ok(report[key], `missing section ${key}`);
  }
  assert.ok(report.totals.emittedChars > 0);
  assert.ok(report.totals.cumulativeContextChars >= report.totals.emittedChars);
});

test('capture section compares both modes over the modeled session', () => {
  const { capture } = JSON.parse(runReport(['--turns', '30', '--json']));
  assert.equal(capture.tickets, 3); // one ticket per 10 turns
  assert.equal(capture.modes.gates.dispatches, 6);
  assert.equal(capture.modes.opportunistic.dispatches, 15);
  assert.ok(capture.modes.gates.chars > 0);
  assert.ok(
    capture.modes.gates.chars < capture.modes.opportunistic.chars,
    'gates capture must cost less than opportunistic'
  );
});

test('capture model scales with session length and never drops below one ticket', () => {
  const short = JSON.parse(runReport(['--turns', '5', '--json'])).capture;
  assert.equal(short.tickets, 1);
  const long = JSON.parse(runReport(['--turns', '100', '--json'])).capture;
  assert.equal(long.tickets, 10);
  assert.equal(long.modes.gates.dispatches, 20);
});

test('human-readable output prints the two capture modes side by side', () => {
  const out = runReport(['--turns', '30']);
  assert.match(out, /capture modes \(3 ticket\(s\) over 30 turns\)/);
  assert.match(out, /gates:\s+6 curator dispatches/);
  assert.match(out, /opportunistic:\s+15 curator dispatches/);
});
