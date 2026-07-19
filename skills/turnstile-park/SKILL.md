---
name: turnstile-park
description: Stashes the single in-progress ticket -- status parked with parked_at, resume note (current state, next step, blockers) in the item note -- so urgent unrelated work can start. Dispatched by /turnstile:park or conversate routing only.
argument-hint: "[reason]"
user-invocable: false
---

# Park

<important>
- Park exists so the one-in_progress rule survives interrupts: the parked ticket stops counting against it, urgent work starts clean, and nothing is half-forgotten. It is a stash, not a cancellation -- for abandoning work, /turnstile:drop.
- A parked item must leave behind a resume note -- a "## Resume" section in its item note covering current state, next step, and blockers -- and a parked_at timestamp on the board. The validation hook enforces both; write them in the same pass as the status change.
- Confirm once before writing: show the drafted resume note and the reason. No confirmation, no park.
- Uncommitted implementation changes stay in the working tree and would bleed into the next ticket's review diff. Surface them (git status), record their file list in the resume note, and suggest the user stash them (e.g. `git stash push -m "turnstile park <id>"`) before starting other work -- never stash or discard on your own.
</important>

## Process

1. Find the `in_progress` item on the current board -- `turnstile/sprint.yml` (sprint or `mode: flow`), or a legacy root `turnstile/sprint-*.yml` with `sprint.status: active`. None: nothing to park; point at the board and stop.
2. Take the reason from `$ARGUMENTS`, or ask -- a few words suffice.
3. Draft the resume note from the item's `notes`, the criteria source (spec/plan/item note), and `git status`/`git diff`: **current state** (what is done, what is half-done, uncommitted files if any), **next step** (the single concrete action to take on return), **blockers** (open questions, missing decisions, or "none").
4. Present the resume note and reason; ask for one confirmation. Revise on request. Write nothing until confirmed.
5. Once confirmed, in one pass: append or update the `## Resume` section in the item note (`US-<n>`/`TK-<n>`; create the note per the turnstile-brain item-note format if a legacy item lacks one) and set `updated`; on the board set the item's `status: parked` and add `parked_at: <now, ISO 8601>`; append `parked: <reason>` to the item's `notes`.
6. If uncommitted changes exist, remind the user they are still in the working tree (with the stash suggestion above).
7. Tell the user the ticket is parked and `/turnstile:pickup` will offer to un-park it.

## Error handling

- **Item is `status: review`:** an interrupted review, not implementation -- suggest finishing `/turnstile:review <id>` instead; park only on explicit insistence (set it back through `in_progress` first is unnecessary -- park from review directly, noting it in the resume note).
- **Malformed YAML in a board file:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
