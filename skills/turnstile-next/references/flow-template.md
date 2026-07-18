# Flow board template

Read when next creates turnstile/sprint.yml as a flow board. The file name
stays sprint.yml so every board hook and skill path applies unchanged; the
`mode: flow` marker is what distinguishes it.

    sprint:
      name: "Flow board"
      mode: flow
      started: <today, YYYY-MM-DD>
      status: active
    items: []

Pulled items are appended with the same tracking fields sprint items carry
(id, title, type, parent, status, points, assignee, carryovers: 0, notes).
No goal, no number, no end date -- flow has no sprint ceremony. The board is
never archived while cadence stays flow; done items accumulate as history.
