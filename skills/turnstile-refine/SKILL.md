---
name: turnstile-refine
description: Gap-closing dialogue that turns a raw idea into an explicitly approved design doc and backlog item. Gate 1a. Dispatched by /turnstile:refine, conversate routing, or brainstorm only.
argument-hint: "[idea description]"
user-invocable: false
---

# Refine

<important>
- Do not finish this skill until acceptance_criteria (non-empty), a points estimate, and an assignee are all known. Ask one question at a time for anything missing or ambiguous.
- Profile check first: run `node ${CLAUDE_PLUGIN_ROOT}/scripts/config.js` (one JSON line; surface any warnings once). profile: solo collapses design and spec for leaf items into one plan artifact -- turnstile/plans/PL-<n>.md holding design and acceptance criteria together -- with one approval, after which the item enters the backlog as status: ready directly. profile: full (the default) keeps the separate design doc and /turnstile:spec gate. Epic-sized ideas use the full breakdown pipeline in both profiles.
- Gap-closing includes architecture and design, not just requirements: establish where the work sits in the existing system (check turnstile/architecture/ and turnstile/decisions/) and which design decisions it forces. A significant decision made here becomes an ADR via brain-curator.
- Do not add the item to turnstile/backlog.yml until the user has explicitly approved the design doc. "Looks good" or equivalent counts as approval; silence does not.
- Search the vault (brain, decisions, architecture, item notes) for related notes before starting the dialogue, and surface what you find.
- Assess scale during the dialogue: an idea with multiple independent deliverables, or an estimate above 8 points, is an epic. Record it with type: epic and hand off to turnstile-breakdown -- do not force epic-sized work into one flat ticket.
- Before writing any file in steps 4 and 6, Read references/templates.md from this skill's base directory and use those exact formats.
</important>

## Process

1. Search the vault (brain, decisions, architecture, item notes -- search_notes indexes all of them) for notes related to the idea's topic ($ARGUMENTS). Surface anything relevant, including conflicts, before continuing.
2. Compute the next ticket ID: scan `turnstile/backlog.yml`, `turnstile/sprint.yml`, `turnstile/sprints/*.yml`, and any legacy `turnstile/sprint-*.yml` for existing `C-<N>` ids; the new id is `C-<max+1>`, or `C-1` if none exist.
3. Run a one-question-at-a-time dialogue to establish:
   - A clear title and one-paragraph problem description.
   - **Architecture fit:** where this sits in the existing system. Read related `AR-*` and `adr-*` notes first; ask about integration points and affected components. If the work contradicts an existing ADR, surface the conflict explicitly -- the user decides whether the old decision is superseded, and brain-curator records the superseding ADR.
   - **Design decisions:** the approach, and any choice between real alternatives this work forces. Close these gaps now -- a ticket that reaches `/turnstile:work` with an open design question was refined too early.
   - Non-empty `acceptance_criteria` (concrete, checkable statements).
   - A `points` estimate (any positive integer the user agrees to).
   - `assignee`: `claude` or `human` (default `claude`).
   While talking, assess scale: multiple independent deliverables or an estimate above 8 points means `type: epic`, with acceptance criteria at the outcome level; the pieces get their own criteria later via `/turnstile:breakdown`.
4. Check whether the target artifact already exists (`<n>` from `<id>` = `C-<n>`): `turnstile/designs/DS-<n>.md` in full profile, `turnstile/plans/PL-<n>.md` in solo (check both -- the profile may have switched), or a legacy `turnstile/designs/<id>*.md`. An existing file with no matching board entry is an abandoned draft from a prior refine session: warn the user and ask whether to overwrite it or use `id+1` for a fresh draft (re-checking the new id for a collision too). Never overwrite silently. Then write `turnstile/designs/DS-<n>.md` (full) or `turnstile/plans/PL-<n>.md` (solo leaf; epics always get a design doc) per the templates reference.
5. Present the design doc (or plan) content and ask for explicit approval. Revise and re-present until approved; do not proceed without it. In solo this is the item's only pre-work gate -- the plan's criteria are what /turnstile:review will check.
6. Once approved: append the item to `turnstile/backlog.yml` (creating it with `items: []` first if missing) and write the item note (`EP-<n>` for an epic, `US-<n>` otherwise), both per the templates reference. Solo leaf items enter with `status: ready`; full-profile items and epics with `status: idea`. Write the design doc (or plan) and item note in the same pass -- they link each other. Before finishing, confirm every [[wikilink]] added resolves (list_unresolved_links); an unresolved link is a click-trap that mints a stray note.
7. If the dialogue surfaced something worth remembering, dispatch `brain-curator` with a short description: a choice between real alternatives becomes a decision record, newly established system shape an architecture note -- tell the curator which item notes the note affects.
8. Tell the user what is next: full profile -- the design is recorded and `/turnstile:spec <id>` is next; solo -- the plan is approved and the item is `ready` for `/turnstile:sprint-plan`. For an epic (either profile), invoke `turnstile-breakdown` with the epic's id (its own approval gate governs the split).

## Error handling

- **User has no clear idea yet:** ask open-ended questions to articulate the problem first; don't force the checklist prematurely. Acceptance criteria without a stated problem are usually wrong.
- **Work contradicts a recorded ADR:** surface it; never silently ignore it.
- **Malformed YAML in a board file:** surface the parse error; ask the user to fix it by hand.
