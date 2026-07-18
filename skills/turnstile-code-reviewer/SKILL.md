---
name: turnstile-code-reviewer
description: Advisory, non-gated review of code or a diff for bugs and simplification; never commits or touches ticket status. Dispatched by /turnstile:code-reviewer or conversate routing only.
argument-hint: "[optional: files or scope to review]"
user-invocable: false
---

# Code Reviewer

<important>
- Never commit, never change a ticket's `status`, and never edit `turnstile/backlog.yml` or any sprint file from this skill. It only reports findings.
- This is not the ticket done-ness gate. If the user is asking whether a ticket is done and ready to ship, point them at `/turnstile:review <id>` instead. Unrelated to the `turnstile-reviewer` agent (which /turnstile:review dispatches internally) -- this skill never invokes it.
- Search the vault (brain, decisions, architecture) for related notes before reviewing -- prior gotchas and recorded decisions in this area change what to look for.
</important>

## Process

1. Determine the review target: files or scope from `$ARGUMENTS`, else `git diff` / `git status` for the current uncommitted changes. Nothing to review (no changes, no target): say so and ask what they'd like reviewed.
2. Search the vault for notes on the affected area. Surface anything relevant -- known gotchas, and any ADR the change might contradict -- before reviewing.
3. Review for: correctness bugs (logic errors, edge cases, incorrect assumptions) and reuse/simplification (duplicated logic, unnecessary complexity, existing utilities that should be used).
4. Report findings as a list -- file/location, what's wrong, why it matters. Nothing significant: say so plainly rather than inventing nitpicks.
5. If a finding reveals a durable gotcha worth remembering (not a one-off bug), dispatch `brain-curator` with a short description.
