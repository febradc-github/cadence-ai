---
name: turnstile-drop
description: Cancels a ticket -- status dropped with a recorded reason; history is never deleted. Dispatched by /turnstile:drop or conversate routing only.
argument-hint: "[id] [reason]"
user-invocable: false
---

# Drop

<important>
- Dropping is cancellation with a paper trail, not deletion. Never remove the item's YAML entry or its notes -- set status: dropped and record why.
- Confirm with the user before writing: state the item, where it lives, and the reason that will be recorded. No reason, no drop.
- A dropped item's files (item note, design, spec) stay in the vault as history.
</important>

## Process

1. Look up `<id>` (from `$ARGUMENTS`) in `turnstile/backlog.yml` and `turnstile/sprint.yml`. Not found in either: refuse -- archived items are immutable history and cannot be dropped.
2. If the item is `in_progress`, warn there may be uncommitted implementation changes from `/turnstile:work`; ask whether to discard, keep, or commit them separately before dropping. Do not silently strand a half-done diff.
3. If the item is a container (epic or story with children), list its non-done children and ask whether they drop too -- a dropped parent with live children is usually a mistake. If the user insists on parent-only, warn that the children now reference a dropped parent. Drop each confirmed child the same way.
4. Confirm: item id and title, current status and location, and the reason (from `$ARGUMENTS`, or ask -- a few words suffice).
5. Once confirmed, for the item (and each confirmed child): set `status: dropped` in its board file and set `updated` to today (backlog items) or append `dropped: <reason>` to `notes` (sprint items); update its item note -- set `updated`, add a line `Dropped <YYYY-MM-DD>: <reason>` under the heading.
6. If the reason is a process learning (e.g. repeatedly planning work that gets cancelled), dispatch `brain-curator` with it.
7. Tell the user what was dropped and where the record lives.

## Error handling

- **Malformed YAML in a board file:** surface the parse error and ask the user to fix it by hand -- never guess or auto-repair.
