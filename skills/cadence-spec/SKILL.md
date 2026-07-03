---
name: cadence-spec
description: Turns an approved design doc into a concrete, checkable spec file. Requires the user's explicit approval before the item can be marked ready. Gate 1b of the cadence workflow. Only invoke when dispatched by the /cadence:spec command or cadence-conversate routing.
argument-hint: "[id]"
user-invocable: false
---

# Spec

<important>
- Refuse to run if cadence/backlog.yml has no item with this id and status: idea, or if no design doc exists for it (cadence/designs/<id>-*-design.md, or the legacy cadence/designs/<id>.md). Tell the user to run /cadence:refine first.
- Refuse epics and containers (items with type: epic, or items another item names as parent). Only leaf stories and tasks get spec'd; direct the user to /cadence:breakdown and to spec the children instead.
- Do not flip the item's status to ready until the user has explicitly approved the spec file.
- Design and spec are always separate files. Never skip writing the spec file and just reuse the design doc.
</important>

## Purpose

Converts the rationale in the item's design doc into a checklist of concrete acceptance criteria that `/cadence:review` can later verify mechanically, and gates the item's move to `ready`.

## Process

1. Look up `<id>` (from `$ARGUMENTS`) in `cadence/backlog.yml`. If no item exists with that id and `status: idea`, refuse and tell the user to run `/cadence:refine <idea>` first. If the item has `type: epic`, or any other backlog item names it as `parent`, refuse: containers are never spec'd -- point the user at `/cadence:breakdown <id>` (if it has no children yet) or at spec'ing its children.
2. Read the item's design doc: `cadence/designs/<id>-*-design.md`, falling back to the legacy `cadence/designs/<id>.md`. If neither exists, refuse with the same message.
3. Search the vault (brain, decisions, architecture, item notes -- the search_notes MCP tool indexes all of them) for notes related to `<id>`'s topic. Surface anything relevant, including conflicts, before continuing.
4. If a spec file for `<id>` already exists (the item's `status` is still `idea`, so this is not an approved spec -- it can only be a draft left over from an abandoned prior `/cadence:spec` session), warn the user it looks like a leftover draft and ask whether to overwrite it or keep it as-is before continuing. Do not silently overwrite it.
5. Write `cadence/specs/<id>-<slug>-spec.md` (same `<slug>` as the design doc), turning the design's "Acceptance criteria" section into a checklist, and carrying forward anything explicitly out of scope from the dialogue:

       ---
       type: spec
       tags: []
       created: <today, YYYY-MM-DD>
       updated: <today, YYYY-MM-DD>
       related: ["[[<id>-<slug>]]", "[[<id>-<slug>-design]]"]
       sources: []
       ---

       # <id>: <title> -- Spec

       ## Acceptance criteria
       - [ ] <criterion 1>
       - [ ] <criterion 2>

       ## Out of scope
       <explicitly excluded items discussed during refine, or "None.">

       ## Reference
       See [[<id>-<slug>-design]] for rationale and trade-offs.

6. Present the spec file content to the user and ask them to explicitly approve it. If they request changes, revise and re-present. Do not proceed until approved.
7. Once approved, update the item in `cadence/backlog.yml`:
   - `status: ready`
   - `acceptance_criteria` set to match the checklist items verbatim (as plain strings, without the `[ ]` markers)
   - `updated` set to today's date

   And update the item's note (in `cadence/user-stories/` or `cadence/tasks/`): add `- Spec: [[<id>-<slug>-spec]]` to its links, add the spec to `related`, and set `updated` to today. (A legacy item with no note yet: create one now in its type's folder, following the cadence-brain item note format.)
8. Tell the user the item is `ready` and can be pulled into a sprint with `/cadence:sprint-plan`.

## Inputs

`cadence/backlog.yml`, the item's design doc, the vault's markdown notes.

## Outputs

`cadence/specs/<id>-<slug>-spec.md` (new file), the item's note (spec linked), `cadence/backlog.yml` (item's `status`, `acceptance_criteria`, `updated` fields).

## Error handling

- **No matching idea-status item, or missing design doc:** refuse; direct the user to `/cadence:refine <idea>`.
- **Item is an epic or container:** refuse; direct the user to `/cadence:breakdown <id>` or to its children.
- **User approves with changes each round:** keep revising and re-presenting until they approve without changes -- don't flip status on a conditional approval.
- **A spec file already exists at this id:** warn the user it looks like an abandoned draft; ask before overwriting.
- **Malformed YAML in backlog.yml:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
