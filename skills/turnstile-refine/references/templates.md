# Refine templates

Read when refine reaches its write steps. `<n>` is the ticket number from
`<id>` = `C-<n>`.

## Design doc — turnstile/designs/DS-<n>.md

    ---
    type: design
    tags: []
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: ["[[<EP-n|US-n>]]"]
    sources: []
    ---

    # <id>: <title> -- Design

    ## Problem
    <problem statement from the dialogue>

    ## Architecture
    <where this sits in the system: affected components, integration
    points, and links to the [[AR-...]] and [[adr-...]] notes it relies
    on or bends -- link only notes that exist (verified in the step 1
    search); name a missing one in plain text instead>

    ## Approach
    <the approach agreed on>

    ## Trade-offs considered
    <alternatives discussed and why not chosen, or "None discussed.">

    ## Acceptance criteria
    - <criterion 1>
    - <criterion 2>

    ## Estimate
    <points> points

    ## Assignee
    <claude|human>

## Plan (solo profile) — turnstile/plans/PL-<n>.md

Solo leaf items get this single artifact instead of DS-<n> + SP-<n>. Same
sections as the design doc, but its Acceptance criteria section is the one
/turnstile:review checks — write them as concrete, checkable statements.

    ---
    type: plan
    tags: []
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: ["[[<US-n|TK-n>]]"]
    sources: []
    ---

    # <id>: <title> -- Plan

    ## Problem
    <problem statement from the dialogue>

    ## Architecture
    <same rules as the design doc's Architecture section>

    ## Approach
    <the approach agreed on>

    ## Trade-offs considered
    <alternatives discussed and why not chosen, or "None discussed.">

    ## Acceptance criteria
    - <concrete, checkable criterion 1>
    - <criterion 2>

    ## Estimate
    <points> points

    ## Assignee
    <claude|human>

## Backlog entry — appended to turnstile/backlog.yml items

    - id: <id>
      title: "<title>"
      status: idea
      points: <points>
      assignee: <claude|human>
      created: <today, YYYY-MM-DD>
      updated: <today, YYYY-MM-DD>

For an epic-sized item, add `type: epic` after `title`. A solo-profile leaf
item enters with `status: ready` instead of `idea` — its plan approval was
the gate. The board holds tracking fields only — the description lives in
the item note, the criteria in the design doc and later the spec (or the
solo plan). Never copy prose into YAML.

## Item note — turnstile/epics/EP-<n>.md (epic) or turnstile/user-stories/US-<n>.md

    ---
    type: <epic|story>
    tags: []
    aliases: ["<id>", "<title>"]
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: ["[[DS-<n>]]"]
    ---

    # <id>: <title>

    <one-paragraph description>

    - Design: [[DS-<n>]]

For a solo-profile leaf item, the link line is `- Plan: [[PL-<n>]]` and the
frontmatter `related` entry is `"[[PL-<n>]]"` instead.

Aliases make the quick switcher and search_notes find the note by board id or
title — but aliases never resolve raw wikilinks, so links always use the
typed name ([[EP-<n>]]/[[US-<n>]]), never [[<id>]].
