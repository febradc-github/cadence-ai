#!/usr/bin/env node
// PostToolUse validator for cadence board files (backlog.yml, sprint-N.yml).
// Structural checks only -- no YAML dependency. Exit 2 feeds the problems
// back to Claude so the bad write is corrected immediately.

const fs = require('node:fs');
const path = require('node:path');

const BACKLOG_STATUSES = new Set(['idea', 'ready']);
const ITEM_STATUSES = new Set(['todo', 'in_progress', 'review', 'done']);
const SPRINT_STATUSES = new Set(['active', 'completed']);

// Returns { sprintStatus, items: [{id, status}], problems: [] }
function scanBoardFile(filePath, kind) {
  const problems = [];
  const items = [];
  let sprintStatus = null;
  let inItems = false;
  let current = null;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (/^items:/.test(line)) {
      inItems = true;
      continue;
    }
    const idMatch = line.match(/^\s*-\s+id:\s*["']?(\S+?)["']?\s*$/);
    if (idMatch && inItems) {
      current = { id: idMatch[1], status: null };
      items.push(current);
      if (!/^C-\d+$/.test(current.id)) {
        problems.push(`${path.basename(filePath)}: id "${current.id}" does not match C-<number>`);
      }
      continue;
    }
    const statusMatch = line.match(/^\s*status:\s*["']?(\S+?)["']?\s*$/);
    if (!statusMatch) continue;
    const status = statusMatch[1];
    if (inItems && current) {
      current.status = status;
      const allowed = kind === 'backlog' ? BACKLOG_STATUSES : ITEM_STATUSES;
      if (!allowed.has(status)) {
        problems.push(
          `${path.basename(filePath)}: item ${current.id} has invalid status "${status}" (allowed: ${[...allowed].join(', ')})`
        );
      }
    } else if (!inItems && kind === 'sprint') {
      sprintStatus = status;
      if (!SPRINT_STATUSES.has(status)) {
        problems.push(`${path.basename(filePath)}: sprint status "${status}" is invalid (allowed: active, completed)`);
      }
    }
  }
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) problems.push(`${path.basename(filePath)}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
  return { sprintStatus, items, problems };
}

function validate(cadenceDir) {
  const problems = [];
  const backlogPath = path.join(cadenceDir, 'backlog.yml');
  const backlogIds = new Set();
  if (fs.existsSync(backlogPath)) {
    const backlog = scanBoardFile(backlogPath, 'backlog');
    problems.push(...backlog.problems);
    backlog.items.forEach((i) => backlogIds.add(i.id));
  }

  const sprintFiles = fs
    .readdirSync(cadenceDir)
    .filter((f) => /^sprint-\d+\.yml$/.test(f))
    .sort();
  const activeSprints = [];
  const liveIds = new Map(); // id -> file it lives in (backlog or an active sprint)
  backlogIds.forEach((id) => liveIds.set(id, 'backlog.yml'));

  for (const file of sprintFiles) {
    const sprint = scanBoardFile(path.join(cadenceDir, file), 'sprint');
    problems.push(...sprint.problems);
    if (sprint.sprintStatus !== 'active') continue;
    activeSprints.push(file);
    const inProgress = sprint.items.filter((i) => i.status === 'in_progress');
    if (inProgress.length > 1) {
      problems.push(`${file}: ${inProgress.length} items are in_progress (${inProgress.map((i) => i.id).join(', ')}); only one is allowed`);
    }
    for (const item of sprint.items) {
      if (liveIds.has(item.id)) {
        problems.push(`${item.id} exists in both ${liveIds.get(item.id)} and ${file}; an item has exactly one live copy`);
      } else {
        liveIds.set(item.id, file);
      }
    }
  }
  if (activeSprints.length > 1) {
    problems.push(`multiple active sprints (${activeSprints.join(', ')}); complete the old sprint before opening a new one`);
  }
  return problems;
}

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const filePath = (input.tool_input && input.tool_input.file_path) || '';
  if (!/[\\/]cadence[\\/](backlog\.yml|sprint-\d+\.yml)$/.test(filePath)) process.exit(0);
  const cadenceDir = path.dirname(filePath);
  let problems;
  try {
    problems = validate(cadenceDir);
  } catch {
    process.exit(0); // validator error must never break the session
  }
  if (problems.length === 0) process.exit(0);
  process.stderr.write('cadence board validation failed:\n- ' + problems.join('\n- ') + '\n');
  process.exit(2);
});
