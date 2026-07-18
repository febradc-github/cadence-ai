# Quick item note template

Read when quick writes the item note -- `turnstile/tasks/TK-<n>.md` or
`turnstile/user-stories/US-<n>.md`.

    ---
    type: <task|story>
    tags: []            # add bug for bug fixes
    aliases: ["<id>", "<title>"]
    created: <today, YYYY-MM-DD>
    updated: <today, YYYY-MM-DD>
    related: []
    ---

    # <id>: <title>

    <one-paragraph description; for bugs: the confirmed root cause>

    ## Acceptance criteria
    - <criterion 1>
    - <criterion 2>

Sprint entries also get `carryovers: 0`, `notes: ""`.
