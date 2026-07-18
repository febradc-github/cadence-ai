---
name: turnstile-breakdown
description: Decomposes an epic into stories or an oversized story into tasks; writes child designs and backlog entries after explicit approval. Gate 1a-b. Dispatched by /turnstile:breakdown, conversate routing, or refine only.
argument-hint: "[id]"
user-invocable: false
---

# Breakdown

<important>
- Do not write any child to turnstile/backlog.yml until the user has explicitly approved the full breakdown. "Looks good" or equivalent counts as approval; silence does not.
- Only backlog items can be broken down. Refuse items living in a sprint file -- breaking down mid-sprint work invalidates the sprint's scope.
- Two levels of nesting maximum: epic -> story -> task. Refuse type: task items; tasks are always leaves.
- Every child gets non-empty acceptance_criteria and a points estimate before the proposal is presented. No placeholder children.
- Search the vault (brain, decisions, architecture, item notes) for related notes before proposing the breakdown, and surface what you find.
- Before writing any file in step 7, Read references/templates.md from this skill's base directory and use those exact formats.
</important>

## Process

1. Look up `<id>` (from `$ARGUMENTS`) in `turnstile/backlog.yml`.
   - Found in a sprint file instead: refuse; sprint items are already committed scope.
   - Not found anywhere: refuse; suggest `/turnstile:refine <idea>` to create it first.
   - `type: task`: refuse; tasks are leaves. A too-big task means the parent story's breakdown is wrong -- revisit that instead.
2. Decide the child type: `epic` parent -> `story` children; `story` parent (explicit or absent `type`) -> `task` children.
3. Search the vault (brain, decisions, architecture, item notes) for notes related to the item's topic. Surface anything relevant, including conflicts.
4. Read the item's design doc -- `turnstile/designs/DS-<n>.md` (`<n>` from `<id>` = `C-<n>`), falling back to legacy names (`turnstile/designs/<id>-*-design.md`, `turnstile/designs/<id>.md`) -- plus the parent epic's design when breaking a story with a `parent`. No design doc: refuse and direct the user to `/turnstile:refine` -- breakdown decomposes an approved design, it does not invent one.
5. Draft 2-8 children. Each: clear title, one-paragraph description, non-empty `acceptance_criteria`, a `points` estimate, an `assignee` (inherit the parent's unless told otherwise). Children must partition the parent's scope: together they cover its acceptance criteria, no two overlap. If the scope honestly fits in one child, say so and recommend skipping breakdown.
6. Present the full proposal (every child, every field) for explicit approval. Revise and re-present on requested changes. Write nothing until approved.
7. Once approved, per the templates reference:
   - Mint child ids: scan `turnstile/backlog.yml`, `turnstile/sprint.yml`, `turnstile/sprints/*.yml` (plus legacy `turnstile/sprint-*.yml`) for existing `C-<N>` ids; children get `C-<max+1>`, `C-<max+2>`, ... For each id, check no `DS-<n>` design (or legacy equivalent) already exists -- an abandoned draft may hold it; if so, warn the user and skip to the next free id. Never overwrite silently.
   - Write each child's design doc and item note as one pass per child -- they cross-link.
   - Update the parent's item note: add each child under a `Children:` list, add them to `related`, set `updated` to today. (A legacy parent with no item note: create one now in its type's folder.)
   - Append each child to `turnstile/backlog.yml`, and update the parent there: it is now a container -- if its `status` was `ready`, set it back to `idea` (containers never enter sprints), and set `updated` to today.
   - Before finishing, confirm every [[wikilink]] added resolves (list_unresolved_links); an unresolved link is a click-trap that mints a stray note.
8. If the dialogue surfaced something worth remembering (a scoping decision, a rejected split and why), dispatch `brain-curator` with a short description.
9. Tell the user the breakdown is recorded and each child needs `/turnstile:spec <child-id>` to become `ready`.

## Error handling

- **Parent already has children:** a second breakdown pass. List the existing children first and only propose non-overlapping additions; never duplicate an existing child.
- **User keeps rejecting proposals:** keep revising; if the disagreement is about the parent's scope itself, recommend revisiting the refine design doc rather than forcing a split.
- **Malformed YAML in backlog.yml:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
