---
name: turnstile-next
description: Flow-mode pull -- moves the top ready backlog item onto the flow board as todo after one confirmation; points at the in-progress item if one exists. Dispatched by /turnstile:next or conversate routing only.
user-invocable: false
---

# Next

<important>
- Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/config.js` first (surface any warnings once). cadence: sprint -- this command is flow-mode only: explain that sprints pull work via /turnstile:sprint-plan and stop.
- The flow board is turnstile/sprint.yml with `mode: flow` under the sprint header -- same filename, same invariants (one active board, one in_progress, one live copy per item). It is never archived while cadence stays flow.
- The queue is the backlog's ready leaf items in file order -- oldest first, no re-ranking ceremony. The user confirms (or overrides) the pull; no confirmation, no write.
- Only one item may be in_progress; parked items do not count and never block a pull. If something is already in_progress, point at it instead of pulling more work.
- Before creating the flow board, Read references/flow-template.md from this skill's base directory and use that exact format.
</important>

## Process

1. Read the config. `cadence: sprint`: explain and stop (see above).
2. Look at `turnstile/sprint.yml`:
   - Absent: the flow board will be created in step 4.
   - Active with `mode: flow`: this is the board.
   - Active without `mode: flow`: an active sprint predates the flow switch. Refuse to pull; tell the user to archive it first via `/turnstile:sprint-plan` (its flow-mode explainer offers the archive step). Never convert a live sprint in place.
3. If the board has an item with `status: in_progress` or `todo`, report it and stop -- flow pulls one piece of work at a time: `in_progress` -> finish it (`/turnstile:review <id>`); `todo` -> start it (`/turnstile:work <id>`). Do not pull a second item past a waiting one unless the user explicitly says to skip it (then proceed, leaving the todo in place).
4. Read `turnstile/backlog.yml` and list the ready leaf items (exclude `type: epic` and anything named as a `parent`) in file order. The top item is the pull candidate; show it (id, title, points) with the next few queued behind it. No ready items: say the queue is empty and suggest `/turnstile:refine` or `/turnstile:quick`; if ready-looking work is stuck in an unbroken epic, point at `/turnstile:breakdown <epic-id>`. Stop.
5. Ask for one confirmation (the user may pick a different queued item -- their call). Once confirmed: create the flow board per the template if it does not exist, append the item with `status: todo` and `carryovers: 0`, and remove it from `turnstile/backlog.yml` -- one live copy per item.
6. Search the vault for notes related to the pulled item's topic; surface anything relevant.
7. Tell the user the item is on the board and `/turnstile:work <id>` starts it.

## Error handling

- **Malformed YAML in a board file:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
