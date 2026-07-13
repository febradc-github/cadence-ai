---
name: cadence-spec
description: Turns an approved design doc into a checkable spec; explicit approval marks the item ready. Gate 1b. Dispatched by /cadence:spec or conversate routing only.
argument-hint: "[id]"
user-invocable: false
---

# Spec

<important>
- Refuse to run if cadence/backlog.yml has no item with this id and status: idea, or if no design doc exists for it (cadence/designs/DS-<n>.md, or a legacy cadence/designs/<id>*.md). Tell the user to run /cadence:refine first.
- Refuse epics and containers (items with type: epic, or items another item names as parent). Only leaf stories and tasks get spec'd; direct the user to /cadence:breakdown and to spec the children instead.
- Do not flip the item's status to ready until the user has explicitly approved the spec file -- keep revising on requested changes; never flip on a conditional approval.
- Design and spec are always separate files. Never skip writing the spec file and just reuse the design doc.
- Before writing the spec file, Read references/template.md from this skill's base directory and use that exact format.
</important>

## Process

1. Look up `<id>` (from `$ARGUMENTS`) in `cadence/backlog.yml` and apply the refusals above.
2. Read the item's design doc: `cadence/designs/DS-<n>.md` (`<n>` from `<id>` = `C-<n>`), falling back to legacy names (`cadence/designs/<id>-*-design.md`, `cadence/designs/<id>.md`).
3. Search the vault for notes related to `<id>`'s topic. Surface anything relevant, including conflicts, before continuing.
4. If a spec file for `<id>` already exists (status is still `idea`, so it can only be a draft from an abandoned prior session), warn the user and ask whether to overwrite or keep it. Never overwrite silently.
5. Write `cadence/specs/SP-<n>.md` per the template reference.
6. Present the spec content and ask for explicit approval. Revise and re-present until approved.
7. Once approved, update the item in `cadence/backlog.yml`: `status: ready`, `updated` = today. The spec file is the sole home of the criteria -- never copy them into YAML (remove a legacy `acceptance_criteria` field if present). Update the item's note (`US-<n>`/`TK-<n>`): add `- Spec: [[SP-<n>]]`, add the spec to `related`, set `updated` to today. (A legacy item with no note: create one per the cadence-brain item-note format.) Confirm every added [[wikilink]] resolves (list_unresolved_links).
8. Tell the user the item is `ready` for `/cadence:sprint-plan`.

## Error handling

- **Malformed YAML in backlog.yml:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
