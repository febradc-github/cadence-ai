---
name: cadence-conversate
description: Entry point for natural-language cadence requests -- classifies the message against board state, then answers directly or invokes the one matching skill (brainstorm, quick, refine, spec, sprint-plan, work, review, breakdown, drop, systematic-debugger, code-reviewer).
argument-hint: "[what you want]"
user-invocable: false
---

# Conversate

<important>
- Always invoke the matched skill directly via the Skill tool rather than merely telling the user which command to run. The invoked skill's own internal approval gates (design-doc approval in refine, spec approval in spec, sprint-goal requirement in sprint-plan, etc.) are the actual safety mechanism -- conversate's job is routing, not gating.
- For any question about what code does or how something is implemented: check `cadence/code/` first (`search_notes`/`read_note`) -- do not reach for Grep/Read as the first move. A matching note exists more often than not once `/cadence:brain-init` has run. See the matching case below for the read-note-then-verify-source procedure.
- Never perform a gated skill's effects yourself inline (never write a design doc or item note directly, never edit a `cadence/code/` note -- only brain-curator writes notes). Only ever: (a) answer a read-only question directly -- which may include dispatching brain-curator to correct a drifted code note -- or (b) invoke exactly one matching skill.
- If genuinely ambiguous, ask one clarifying question instead of guessing which skill to invoke.
</important>

## Process

1. Read `cadence/backlog.yml` (if it exists) and the current sprint -- `cadence/sprint.yml`, or a legacy root `cadence/sprint-*.yml` with `sprint.status: active` -- to build a status snapshot.
2. Match the user's request ($ARGUMENTS plus their message) against these cases, in order:
   - **Status, progress, or "what's on the board":** answer directly from the snapshot (same content as `/cadence:board` or `/cadence:standup`, whichever fits). No skill invocation.
   - **What a piece of code does / how something is implemented:** check `cadence/code/` via `search_notes`/`read_note`. If a note exists, read the source file at its `aliases` path and compare. Still matching: answer directly, citing the verified file. Drifted: answer from the file -- source is truth -- and dispatch `brain-curator` (opportunistic mode, this one file, with the purpose/exports/imports/callers you observed) to correct the note. No note: answer via Grep/Read as usual -- do not dispatch brain-curator just to backfill missing coverage; that's `/cadence:brain-init`'s job. No skill invocation.
   - **A brand-new idea not on the board:** invoke `cadence-brainstorm` with the description. Exception: clearly trivial work (a typo, a tiny chore, ~2 points or less with no design question) goes to `cadence-quick` instead.
   - **Something broken (an error, failing test, unexpected behavior):** invoke `cadence-systematic-debugger` with the report. It diagnoses first, then routes the fix.
   - **Cancel, kill, or drop an item:** invoke `cadence-drop` with that id.
   - **A code review or feedback on a diff:** invoke `cadence-code-reviewer`.
   - **Breaking an item into smaller pieces (or an epic with no children yet):** invoke `cadence-breakdown` with that id.
   - **An existing item the user wants to move forward:**
     - `type: epic`, or another item names it as `parent`: containers don't move through gates. No children yet: invoke `cadence-breakdown`; otherwise report the children's statuses and route to the child at the earliest gate.
     - `status: idea` -> invoke `cadence-spec` with that id. (An item only reaches `idea` after refine's design approval, so a design doc always exists -- never invoke `cadence-refine`, which mints a brand-new id and cannot resume an existing item.)
     - `status: ready`, not in any sprint file -> invoke `cadence-sprint-plan`.
     - In the active sprint, `status: in_progress`, and the user says the work is finished -> invoke `cadence-review` with that id. Check this before the next case.
     - In the active sprint, `status: todo` or `in_progress` (not being called finished) -> invoke `cadence-work` with that id.
     - In the active sprint, `status: review` -> an interrupted review; if the user wants a verdict, invoke `cadence-review` (it resumes). Otherwise report the status.
     - In the active sprint, `status: done` -> already shipped; say so. No skill.
     - `status: dropped` -> cancelled; relay the recorded reason. No skill.
   - **Starting a new sprint:** invoke `cadence-sprint-plan`.
   - **Anything ambiguous:** ask one clarifying question.

## Error handling

- **No backlog or sprint files yet:** the board is empty -- suggest describing what to build so it can route to `cadence-brainstorm`.
- **Invoked skill refuses (malformed YAML, missing design doc):** relay its refusal; do not retry with a different skill.
