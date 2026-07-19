---
name: turnstile-sprint-plan
description: Starts a new sprint -- archives the finished one, rolls over unfinished items, recommends ready items, proposes a goal for confirmation. Dispatched by /turnstile:sprint-plan or conversate routing only.
user-invocable: false
---

# Sprint Plan

<important>
- Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/config.js` first (surface any warnings once). cadence: flow -- there is no sprint ceremony: explain that ready items form a queue and /turnstile:next pulls the top one, then stop. One exception: if an active non-flow sprint still exists (the cadence was switched while a sprint ran), offer to archive it now (set sprint.status: completed, move it to turnstile/sprints/sprint-<N>.yml, roll its unfinished items back to turnstile/backlog.yml as ready) -- with the user's confirmation only -- so the flow switch can take effect. Never create a new sprint in flow mode.
- The current sprint always lives at turnstile/sprint.yml -- one stable filename. Completed sprints are archived to turnstile/sprints/sprint-<N>.yml and never edited again.
- Do not create the new sprint file until the user has explicitly confirmed a sprint goal. Propose one derived from the selected items so confirming is one word, but no goal, no sprint.
- An item has exactly one live copy at a time: either turnstile/backlog.yml or turnstile/sprint.yml. When an item moves, remove it from its old location. Archived sprint files retain carried-over items as an immutable historical record, not a live copy.
- Only leaf items with status: ready in turnstile/backlog.yml may be pulled into a sprint. Epics and containers (items another item names as parent) never enter a sprint -- their children do.
- Sprint items carry tracking fields only (id, title, type, parent, status, points, assignee, carryovers, parked_at, notes). Acceptance criteria live in the spec (SP-<n>), the plan (PL-<n>), or the item note -- never copied into YAML.
- Before writing the new sprint file, Read references/sprint-template.md from this skill's base directory and use that exact format.
</important>

## Process

1. Find the current sprint: `turnstile/sprint.yml`, or (legacy) the root `turnstile/sprint-<N>.yml` with `sprint.status: active`. If one exists and is `active`:
   - Set its `sprint.status` to `completed`.
   - Move it to `turnstile/sprints/sprint-<N>.yml` (`N` from `sprint.number`, or parsed from its `name`; create `sprints/` if missing). Move any other legacy root `sprint-*.yml` files there too -- one-time migration.
   - Collect every item in it whose `status` is not `done` or `dropped`.
   - If any collected item's `carryovers` is already 2 or more, dispatch `brain-curator` with that observation -- a repeatedly-slipping item is worth remembering.
2. Search the vault for process-type notes relevant to sprint planning -- especially estimation bias or recurring blockers. Surface anything relevant, including conflicts.
3. List the `ready` candidates from `turnstile/backlog.yml` (leaf items only -- exclude `type: epic` and anything named as a `parent`), each with id, title, and points, grouped under its parent epic/story when it has one. Mark which items you recommend pulling in, one-line reason each, ranked by:
   - **Capacity first.** Budget = points completed in the just-archived sprint, minus the points of carried-over items. No prior sprint means no velocity data -- say so and recommend a deliberately small starting set.
   - **Finish what's started.** Children of an epic with done or carried-over children come first; closing an epic beats opening a new one.
   - **Coherence.** Prefer items sharing one epic -- a focused sprint yields a natural goal.
   - **Age.** Break ties by oldest `updated` date, so old ready items don't starve.
   Present the recommendation as a default the user can accept in one word, adjust, or replace. The user always has the final pick.
4. Propose a one-line sprint goal derived from the selection and ask the user to confirm it or state their own. Do not proceed without explicit confirmation.
5. Compute the new sprint number: previous `N` + 1 (highest across `turnstile/sprints/` and legacy files), or `1`.
6. Write `turnstile/sprint.yml` per the template reference: carried-over items first (`carryovers` incremented, prior status and notes unchanged), then newly selected items (`status: todo`, `carryovers: 0`).
7. Remove every newly selected item from `turnstile/backlog.yml` (carried-over items were never there -- they came from the old sprint file, already archived).
8. Tell the user the new sprint is open, stating its goal and items.

## Error handling

- **No ready leaf items in the backlog:** tell the user; a sprint with only carried-over items (or an empty one) is still valid if they confirm it. If ready-looking work is stuck inside an unbroken epic, point at `/turnstile:breakdown <epic-id>`.
- **Malformed YAML in an existing file:** surface the parse error location and ask the user to fix it by hand -- never guess or auto-repair.
