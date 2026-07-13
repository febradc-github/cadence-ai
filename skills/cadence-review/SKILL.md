---
name: cadence-review
description: Dispatches the independent cadence-reviewer agent for a done verdict; commits on PASS. Gate 2 -- the implementer never self-certifies. Dispatched by /cadence:review or conversate routing only.
argument-hint: "[id]"
user-invocable: false
---

# Review

<important>
- Never mark an item done yourself. Only a PASS verdict from the cadence-reviewer agent can move status to done.
- Never commit on a FAIL verdict.
- Commits never include an Anthropic or Claude co-author tag, and never use --no-verify (see the brain skill's commit convention).
- Before dispatching cadence-reviewer, confirm no *other* item is in_progress or has uncommitted changes of its own. If git status shows unrelated uncommitted changes (e.g. manual edits outside the workflow), stop and ask the user rather than bundling them into this ticket's diff, review, or commit.
</important>

## Process

1. Look up `<id>` (from `$ARGUMENTS`) in the current sprint -- `cadence/sprint.yml`, or (legacy) the root `cadence/sprint-<N>.yml` with `sprint.status: active`. Not found, or `status` not `in_progress`/`review`: refuse and say what to do instead (`/cadence:work <id>` first; `/cadence:sprint-plan` if no active sprint). `status: review` means a prior review session was interrupted -- say so and resume from step 3. Not a git repository, or no commits yet: tell the user review needs git history to scope the diff; suggest `git init` and an initial commit -- never review an unscoped file tree.
2. Set the item's `status` to `review`.
3. Read the ticket's spec -- `cadence/specs/SP-<n>.md` (`<n>` from `<id>` = `C-<n>`), falling back to legacy names (`cadence/specs/<id>-*-spec.md`, `cadence/specs/<id>.md`). No spec file means a quick-lane item: criteria live in the item note's "## Acceptance criteria" section. Criteria in neither place: refuse -- the item cannot be reviewed.
4. Get the ticket's diff (`git diff` / `git status` against the last commit). Work enforces one in_progress item, so this diff should be exactly this ticket's changes; on unrelated uncommitted changes, stop and ask the user.
5. Dispatch the `cadence-reviewer` agent, passing only the acceptance criteria and the diff -- no implementation-session narrative or reasoning.
6. FAIL verdict: set `status` back to `in_progress`, append the agent's per-criterion reasons to the item's `notes`, tell the user what needs to change. Do not commit.
7. PASS verdict:
   - Set the item's `status` to `done`.
   - If the item has a `parent`, check every child of that parent (across `cadence/backlog.yml`, `cadence/sprint.yml`, `cadence/sprints/*.yml`; match `parent: <parent-id>`). All `done` (ignoring `dropped`): set the parent to `done` in `cadence/backlog.yml` and tell the user; cascade the check one level up if that parent has a `parent`. This rollup is the one exception to "only the reviewer marks done" -- each child was individually reviewer-certified.
   - Compare `points` against the coarse actual-effort signals on hand: `carryovers` and the count of "work pass" notes entries. `carryovers > 0`, or 3+ work passes against 3 points or less (or an equivalent clear mismatch): dispatch `brain-curator` with the observation as a candidate process learning. Never claim wall-clock timing -- only these coarse counts.
   - Stage the changed files together with the updated sprint file (so the `done` status lands in the same commit as the implementation), plus `cadence/backlog.yml` on a parent rollup, and commit: `git commit -m "<verb>: <title> (<id>)"` per the brain skill's convention (no Anthropic/Claude co-author tag, no `--no-verify`).
   - Tell the user the ticket is done and committed.
