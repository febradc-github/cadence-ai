---
name: turnstile-brain-init
description: Bulk-bootstraps turnstile/code/ -- one linked note per source file. Dispatched by /turnstile:brain-init only.
user-invocable: false
---

# Brain Init

<important>
- This skill orchestrates only -- it never writes notes itself. Every note is written by a brain-curator dispatch.
- Bulk batch dispatches override the curator's model to sonnet (the Agent tool's model parameter); the final stitch dispatch uses the curator's default model.
- Reruns are additive: files that already have a code note are skipped. Keeping notes current for changed files is the opportunistic curator path during normal work, not this command.
- Confirm the batch plan with the user once before dispatching -- this is an expensive parallel run.
- Wikilinks to file notes always target the slug ([[scripts-brain-mcp-js|scripts/brain-mcp.js]]); a path inside a link target is an unresolved click-trap that mints a stray note.
</important>

## Process

1. Verify the turnstile-brain MCP tools respond (any search_notes call). Unavailable: tell the user to reload the session so .mcp.json registers the server, and stop. No turnstile/ directory: create nothing; suggest running a cadence command (or /turnstile:install-obsidian) first, and stop.
2. Build the source file list:
   - In a git repo: `git ls-files` (respects .gitignore). Otherwise: a Glob sweep.
   - Keep only these extensions: .js .mjs .cjs .ts .tsx .jsx .py .rb .go .rs .java .kt .c .h .cpp .hpp .cs .php .swift .sh .ps1 .psm1 .sql .vue .svelte .lua .r .scala .ex .exs
   - Always exclude: turnstile/, node_modules/, vendor/, dist/, build/, .git/, lockfiles, minified files (*.min.*), generated files.
   - Nothing left after filtering: say so and stop.
3. List existing code notes and their path aliases -- grep the `aliases:` frontmatter line of each note in turnstile/code/ rather than reading whole notes (a missing code/ folder means no existing notes). Drop every file whose path matches an existing alias. Build one path -> slug map across ALL remaining files at once (lowercase; every run of characters outside a-z0-9 becomes one `-`, trimmed at both ends). Resolve collisions -- against existing notes AND between new files -- by appending -2, -3, ... in path-sorted order.
4. Identify stale notes: every code note whose aliased path no longer exists in the repo. Do not delete anything yet.
5. Plan the batches: group by top-level directory, about 15 files per batch (split large directories, merge tiny ones).
6. Report the plan -- N files in M batches, K skipped as already documented, S stale notes to remove, each stale note named -- and confirm once with the user (AskUserQuestion). After confirmation: delete the stale note files, then dispatch brain-curator once per batch with model: sonnet, at most 4 dispatches in flight. Each dispatch prompt carries: the batch's file paths with slugs, the full linkable-slugs list (every path -> slug in this run plus every existing code note), and the statement that this is bulk code documentation mode.
7. After all batches return, dispatch brain-curator once more (default model) to stitch: for each top-level source directory, create or extend turnstile/architecture/AR-<dir>.md (root-level files: AR-root.md) with a ## Files section linking that directory's file notes in [[slug|path]] form (extend an existing AR note covering the area rather than creating a parallel one); run MOC upkeep for this run's file notes (shared top-level tag code, so moc-code is created or extended once 5+ file notes exist); fix every unresolved link this run introduced, including ones the batch dispatches left behind -- the stitch prompt explicitly authorizes this, overriding the curator's report-don't-fix default; include the slugs of the stale notes deleted in step 6 so the curator runs list_backlinks on each and removes dangling references; finish with list_changed_notes acknowledge: true.
8. Report: notes written, AR notes created or extended, files skipped or failed (a failed batch's files are listed and picked up by a rerun -- they have no notes, so the skip check passes them through), and that /turnstile:obsidian-graph shows the result.
