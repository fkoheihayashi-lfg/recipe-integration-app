# CLAUDE.md

## Mission
Implement and maintain a GitHub-native progress dashboard.

## Phase 1 Rules
- **GitHub Projects** is the source of truth
- **GitHub Issues** display the dashboard (no Discord webhooks needed)
- **GitHub Actions** updates the dashboard automatically
- Do not infer status from conversation—only from Project fields
- Do not write back to Project fields in v1 unless explicitly asked
- Keep the system simple, robust, and reversible

## Required GitHub Project Fields
- **Status** (single select): task status
- **Assignee** (person): who is working on it
- **Area** (single select): optional, for grouping
- **Next Step** (text): optional, what comes next
- **Blocker Reason** (text): optional, why it's stuck

## Expected Status Values
- これから (To Do)
- 作業中 (In Progress)
- 確認待ち (Waiting for Review)
- 困ってる (Blocked/Stuck)
- 完了 (Done)

## GitHub Actions Dashboard Responsibilities
- Query GitHub Projects via GraphQL API
- Normalize Issue / PR / Draft issue data
- Aggregate counts by status
- Render dashboard markdown
- Update a fixed GitHub Issue with the summary
- Run on schedule (no manual intervention needed)

## Guardrails
- Prefer small PRs
- Preserve backward compatibility
- Add comments only where they reduce ambiguity
- Avoid introducing databases in v1
- Avoid UI frameworks or unnecessary libraries
- Prefer plain Node.js and standard HTTPS for API calls
- No external webhooks or third-party services in v1

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