# Code file notes — brain-curator reference

Read this before writing any note in turnstile/code/. One note per source file,
`type: file`. Keep bodies short — a map of the file, not a mirror of it.

## Naming and link safety

Slugify the repo-relative path: lowercase, every run of characters outside
a-z0-9 becomes a single `-`, trimmed at both ends. `scripts/brain-mcp.js`
-> `scripts-brain-mcp-js`. Before creating a note, read_note the slug: if a
note exists whose alias is a *different* path, append `-2`, `-3`, ... until
free. The `aliases` list carries the full repo-relative path only — never the
bare basename (basename aliases collide across directories and trigger the
alias-shadowing stray rule).

A wikilink to a file note targets the slug, never the path:
`[[scripts-brain-mcp-js|scripts/brain-mcp.js]]` resolves and reads as the
path; `[[scripts/brain-mcp.js]]` is an unresolved click-trap that mints a
stray note. External dependencies stay plain text, never linked.

## Format

This body supersedes the generic note body; frontmatter fields are the same.

    ---
    type: file
    tags: [code/<top-level-dir>]       # root-level files: code/root
    aliases: ["<repo-relative path>"]
    created: YYYY-MM-DD
    updated: YYYY-MM-DD
    related: []                        # slugs of in-repo imports, callers, and the module's AR note when known
    sources: []
    ---

    # <repo-relative path>

    One-paragraph purpose: what this file is for and its role in the system.

    ## Exports
    - `name(signature)` -- what it does
    (Omit if nothing is exported.)

    ## Imports
    - [[<slug>|<path>]] -- what is used            # in-repo
    - `fs`, `path` -- Node built-ins               # external: plain text
    (Omit if none.)

    ## Used by
    - [[<slug>|<path>]] -- what it uses from here
    (Only callers backed by evidence. Omit if nothing in-repo uses the file.)

## Step adjustments

Main-procedure steps 1, 9, 12, and 13 apply unchanged. Skip step 3 — the
read_note slug check above replaces the duplicate search — and step 6 — the
tag is derived from the path. Step 10 (MOC upkeep) runs as usual in
opportunistic mode; in bulk mode leave it to the stitch dispatch. One
bulk-mode exception to step 12: leave unresolved targets that are on the
dispatch prompt's linkable-slugs list alone — the orchestrator guarantees
those notes exist by the end of the run, and the stitch dispatch verifies them.

## Two modes (set by the dispatch prompt)

**Opportunistic (default).** The dispatcher just wrote or reviewed the code
and hands you the touched file paths with what it knows: purpose, exports,
known imports/callers. Do not explore the repo. Write or update each file's
note from the supplied facts. Wikilink only targets you verified with
read_note; everything else stays plain text.

**Bulk (dispatched by turnstile-brain-init only).** The prompt carries a batch
of file paths, a linkable-slugs list (path -> slug for every file in the run
plus every already-documented file), and names this mode. Batches contain
only undocumented files. If read_note finds an existing note whose alias
already carries this file's path, skip the file and report it — never
overwrite an existing code note in bulk mode. If a file is unreadable or not
actually text, skip it and report it. Per file, in order:

1. Read the file.
2. List its imports/includes/requires and its exported names (classes,
   functions, constants) by reading — no parser, language-agnostic.
3. Grep the repo for the file's basename and each exported name. Record a
   caller only when the hit is a real import/require/include or a use of the
   exported name — not a comment or a coincidental substring. Never assert
   an unverified connection.
4. Write the note under the slug supplied in the prompt — never re-derive it.
   In-repo connections whose target is on the linkable-slugs list become
   [[slug|path]] links; everything else stays plain text.
5. Add those slugs (and the module's AR note if the prompt names one) to the
   note's `related` list.

In bulk mode, skip the bidirectional `related` back-edit for code notes
written in the same run — each side writes its own links from its own
evidence. Asymmetric related lists between file notes are acceptable:
Obsidian's backlinks pane surfaces the reverse direction, and the stitch
dispatch fixes anything unresolved.
