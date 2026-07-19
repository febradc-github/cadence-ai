---
name: turnstile-remember
description: Files a user-dictated note into the vault via brain-curator -- the user authors the content, the curator only files, tags, and links it. Dispatched by /turnstile:remember or conversate routing only; available in both capture modes.
argument-hint: "[note]"
user-invocable: false
---

# Remember

<important>
- The user is the author. Pass their words to brain-curator as the note content -- verbatim, minus filler like "remember that". Never expand, summarize, editorialize, or add facts the user did not state. The curator's job here is filing only: pick the folder and kind, name the note, tag it, and link it.
- This command works identically in capture: gates and capture: opportunistic -- it is the manual capture path in both.
- No note text given: ask what to remember. Do not guess from conversation context.
</important>

## Process

1. Take the note content from `$ARGUMENTS` (and the rest of the message). Empty: ask the user what to remember, then continue with their answer.
2. Dispatch `brain-curator` with the content marked as user-dictated: the curator routes it by kind (decision -> ADR, system shape -> architecture, everything else -> brain), names, tags, and links it per its own rules, but keeps the body's substance exactly as dictated.
3. Confirm to the user where the note landed (folder and note name) and what it was linked to.

## Error handling

- **The dictated content duplicates an existing note:** the curator updates that note instead of minting a duplicate -- relay which note absorbed it.
