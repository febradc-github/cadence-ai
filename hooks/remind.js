#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const cadenceDir = path.join(process.cwd(), 'cadence');
if (!fs.existsSync(cadenceDir)) {
  process.exit(0);
}

process.stdout.write(
  "This project uses the cadence workflow; never skip a gate. Only /cadence:review marks an item done; search cadence/brain/ before starting new work. Unless you just asked the user a follow-up question inside a gated cadence skill (refine/spec/sprint-plan/work/review), invoke the cadence-conversate skill to classify and route this message.\n"
);
