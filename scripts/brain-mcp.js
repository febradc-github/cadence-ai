#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

function parseLinks(content) {
  const links = [];
  const re = /\[\[([^\]|#]+)/g;
  let m;
  while ((m = re.exec(content))) {
    const target = m[1].trim();
    if (target && !links.includes(target)) links.push(target);
  }
  return links;
}

function parseTags(content) {
  const m = content.match(/^tags:\s*\[([^\]]*)\]/m);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function validName(name) {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    !name.includes('/') &&
    !name.includes('\\') &&
    !name.includes('..') &&
    !name.startsWith('.')
  );
}

function loadBrain(dir) {
  if (!fs.existsSync(dir)) return null;
  const notes = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    notes.push({ name: file.slice(0, -3), content, links: parseLinks(content), tags: parseTags(content) });
  }
  return notes;
}

module.exports = { parseLinks, parseTags, validName, loadBrain };
