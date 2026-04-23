# Prompt — Claude implementation worker

@claude implement the Discord progress dashboard sync feature.

Requirements:
- Use GitHub Projects as the source of truth.
- Read ProjectV2 items through GitHub GraphQL.
- Normalize items into a single internal shape.
- Render a compact Discord dashboard summary.
- Use Cloudflare Worker scheduled() for a 5-minute refresh.
- v1 can post the dashboard message; do not write back to GitHub.
- Keep the code small, clear, and production-safe.

Fields to read:
- Status
- Assignee
- Area
- Next Step
- Blocker Reason

Status values:
- これから
- 作業中
- 確認待ち
- 困ってる
- 完了

Deliverables:
1. Code
2. Secrets/env documentation
3. Test instructions
4. PR summary