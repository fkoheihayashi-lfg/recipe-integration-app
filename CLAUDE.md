# CLAUDE.md

## Mission
Implement and maintain a Discord progress dashboard system.

## Product rules
- GitHub Projects is the source of truth.
- Discord is read-only for dashboard display in v1.
- Do not infer status from Discord conversation.
- Do not write back to GitHub Project fields in v1 unless explicitly asked.
- Keep the system simple, robust, and reversible.

## Required GitHub Project fields
- Status
- Assignee
- Area
- Next Step
- Blocker Reason

## Expected status values
- これから
- 作業中
- 確認待ち
- 困ってる
- 完了

## Worker responsibilities
- Fetch ProjectV2 items through GitHub GraphQL
- Normalize Issue / PR / Draft issue into one shape
- Aggregate counts
- Render dashboard text
- Update fixed Discord webhook messages
- Post alerts when blocker state changes

## Guardrails
- Prefer small PRs
- Preserve backward compatibility
- Add comments only where they reduce ambiguity
- Avoid introducing databases in v1
- Avoid UI frameworks or unnecessary libraries
- Prefer plain TypeScript and fetch

## Review expectations
Whenever you change code:
1. Explain the exact files changed
2. Explain why the change was necessary
3. Identify risks
4. Suggest the next small step

## If something is unclear
Default to:
- read-only sync
- simpler code
- smaller surface area
- fewer moving parts