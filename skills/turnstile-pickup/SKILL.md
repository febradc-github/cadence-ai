---
name: turnstile-pickup
description: Context restoration for returning to work -- reports the in-progress ticket, its implementation state, what was blocking, and the relevant decision/brain notes. This restores work state from the board and vault, unlike Claude Code's built-in /resume which restores a past conversation. Dispatched by /turnstile:pickup, the deprecated /turnstile:standup, or conversate routing only.
user-invocable: false
---

# Pickup

<important>
Read-only, with one exception: the un-park offer in step 4 may -- after explicit user confirmation -- set a parked item back to its pre-park status and remove its parked_at. Nothing else about the board or files ever changes here. Pickup answers "where was I and what was I about to do", not "what progress was made" -- lead with the next action, not a progress report.
</important>

## Process

1. Read the current board -- `turnstile/sprint.yml` (a sprint or a `mode: flow` board), or (legacy boards) the root `turnstile/sprint-*.yml` with `sprint.status: active`. If none exists, tell the user and suggest `/turnstile:sprint-plan` (or `/turnstile:next` in `cadence: flow`).
2. Find the `in_progress` item. For it, report -- in this order:
   - **What you were about to do:** the most actionable open thread -- the last `notes` entry (work passes, debug notes, review FAIL reasons), plus which acceptance criteria look unmet against the current diff (`git status` / `git diff` for uncommitted work-in-progress).
   - **What was blocking:** anything in the notes or the item note that reads as a blocker or open question -- surface it even if stale.
   - **Where it stands:** id, title, status, work-pass count, and its criteria source (spec `SP-<n>`, plan `PL-<n>`, or inline).
   - **Context links:** the item note, its design/plan, and vault notes related to its topic (search_notes) -- especially `adr-*`/`AR-*` notes and anything the last session's curator dispatches recorded.
3. An item with `status: review` and no `in_progress` item: an interrupted review session -- point at `/turnstile:review <id>` to resume it.
4. No in-progress item, but parked item(s) exist: offer to un-park the most recently parked one (highest `parked_at`), reading its `## Resume` section aloud first -- that is the context being restored. On confirmation: set its `status` back to `in_progress`, remove `parked_at`, and append `unparked` to its `notes`; the `## Resume` section stays in the item note as history. Declined: list the parked items and continue to step 5.
5. No in-progress and nothing parked (or un-park declined): say so and point at the natural next move -- the board's `todo` items (`/turnstile:work <id>`), or `/turnstile:sprint-plan` / `/turnstile:next` when the board is empty.
6. Finish with the single next command to run.

## Error handling

- **Malformed YAML in a board file:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
