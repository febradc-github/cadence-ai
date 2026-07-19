# Sprint file template

Read when sprint-plan writes the new turnstile/sprint.yml.

    sprint:
      name: "Sprint <N>"
      number: <N>
      goal: "<goal confirmed by the user>"
      started: <today, YYYY-MM-DD>
      ends: <today + 14 days, YYYY-MM-DD, unless the user states a different length>
      status: active
    items:
      # carried-over items first, each with carryovers incremented by 1
      - id: <id>
        title: "<title>"
        status: <its prior status, unchanged>
        points: <points>
        assignee: <assignee>
        carryovers: <prior carryovers + 1>
        notes: "<prior notes, unchanged>"
      # then newly selected items, each with status: todo and carryovers: 0
      - id: <id>
        title: "<title>"
        status: todo
        points: <points>
        assignee: <assignee>
        carryovers: 0
        notes: ""

Items with `type` and `parent` fields keep both (that is how the board and
review trace them back to their epic/story). A carried-over `parked` item
keeps its `status: parked` and `parked_at` unchanged -- its resume note still
governs it. Do not copy `acceptance_criteria` or descriptions -- they live in
the vault notes.
