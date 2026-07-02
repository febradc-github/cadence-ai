#!/usr/bin/env node
// PreToolUse guard for shell tools: blocks git commits that violate the
// cadence commit convention (no Anthropic/Claude attribution, no --no-verify).
// Exit 2 blocks the tool call and feeds stderr back to Claude.

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // unparseable input: never block
  }
  if (input.tool_name !== 'Bash' && input.tool_name !== 'PowerShell') process.exit(0);
  const command = (input.tool_input && input.tool_input.command) || '';
  if (!/\bgit\b/.test(command) || !/\bcommit\b/.test(command)) process.exit(0);

  const violations = [];
  if (/--no-verify\b/.test(command)) {
    violations.push('cadence forbids --no-verify on commits; fix the hook failure instead.');
  }
  if (/co-authored-by:.*\b(claude|anthropic)\b/i.test(command) || /noreply@anthropic\.com/i.test(command)) {
    violations.push('cadence forbids Anthropic/Claude attribution lines in commit messages; remove the Co-Authored-By trailer.');
  }
  if (violations.length === 0) process.exit(0);
  process.stderr.write(violations.join('\n') + '\n');
  process.exit(2);
});
