# Breakdown templates

Read when breakdown reaches its write step. Each child `C-<n>` gets a design
`DS-<n>` and an item note `US-<n>` (story) or `TK-<n>` (task).

## Child design doc — turnstile/designs/DS-<n>.md

    ---
    type: design
    tags: []
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: ["[[<US-n|TK-n>]]", "[[DS-<parent n>]]"]
    sources: []
    ---

    # <child-id>: <title> -- Design

    ## Parent
    Part of [[<parent item note>]] -- see [[DS-<parent n>]] for the umbrella rationale.

    ## Problem
    <this child's slice of the parent problem>

    ## Approach
    <the approach for this slice>

    ## Acceptance criteria
    - <criterion 1>
    - <criterion 2>

    ## Estimate
    <points> points

    ## Assignee
    <claude|human>

## Child item note — turnstile/user-stories/US-<n>.md or turnstile/tasks/TK-<n>.md

    ---
    type: <story|task>
    tags: []
    aliases: ["<child-id>", "<title>"]
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: ["[[DS-<n>]]", "[[<parent item note>]]"]
    ---

    # <child-id>: <title>

    <one-paragraph description>

    - Design: [[DS-<n>]]
    - Parent: [[<parent item note>]]

## Backlog entry — appended to turnstile/backlog.yml items per child

    - id: <child-id>
      title: "<title>"
      type: <story|task>
      parent: <parent-id>
      status: idea
      points: <points>
      assignee: <claude|human>
      created: <today, YYYY-MM-DD>
      updated: <today, YYYY-MM-DD>

Tracking fields only — each child's description and criteria live in its
design doc and item note, never in YAML.
