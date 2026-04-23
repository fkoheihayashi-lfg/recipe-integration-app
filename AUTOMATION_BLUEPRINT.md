# Discord Progress Automation Pack

## Goal
Build a low-touch progress dashboard where:
- GitHub Projects is the source of truth
- Discord shows a one-page dashboard
- Cloudflare Worker refreshes the dashboard automatically
- Claude Code can implement and update the codebase with minimal manual work

## Best operating model
### Human
Only does:
1. Create or update GitHub Issues
2. Move Project card status
3. Add blocker reason / next step
4. Approve PRs

### GitHub
Handles:
- Project board
- Issue / PR linkage
- Built-in automations:
  - auto-add items to Project
  - set status to Done on close / merge
  - auto-archive completed items

### Cloudflare Worker
Handles:
- scheduled refresh
- reading GitHub Project data
- rendering Discord dashboard text
- updating fixed Discord messages
- sending alert posts when blockers change

### Discord
Handles:
- read-only dashboard channel
- alerts channel
- optional slash commands later

### Claude / Cowork
Handles:
- writing and revising the Worker code
- generating PRs
- fixing regressions
- expanding features later

---

## Recommended channel structure
- #project-dashboard
- #project-alerts
- #project-help
- #project-weekly

Lock #project-dashboard so only the webhook/app can post.

---

## Fastest path
### Phase A — minimal working system
- fixed dashboard messages in Discord
- 5-minute Cloudflare cron refresh
- GitHub Project read-only sync
- blocker alerts only

### Phase B — stronger automation
- GitHub webhook trigger
- change-aware alerts
- details panel
- health endpoint

### Phase C — command layer
- /status
- /mytasks
- /blockers
- /review
- AI summaries

---

## Resource strategy
Use what you already have:
- GitHub repo
- GitHub Project
- Discord server
- Cloudflare Workers free-tier-friendly scheduler
- Claude Code GitHub Action
- Claude Cowork for one-off setup and repair work

This keeps your direct coding time low.

---

## One-time setup checklist
1. Create GitHub Project with fields:
   - Status
   - Assignee
   - Area
   - Next Step
   - Blocker Reason
2. Enable GitHub built-in project automations
3. Create Discord channels
4. Create two Discord webhooks:
   - dashboard
   - alerts
5. Create Cloudflare Worker
6. Add secrets:
   - GITHUB_TOKEN
   - GITHUB_ORG
   - GITHUB_PROJECT_NUMBER
   - DISCORD_DASHBOARD_WEBHOOK_URL
   - DISCORD_ALERTS_WEBHOOK_URL
7. Deploy Worker with cron
8. Install Claude GitHub App or Claude Code GitHub Action
9. Add CLAUDE.md to repo root
10. Start delegating implementation through Issues

---

## Low-touch working rhythm
### For new features
- Create issue
- Tag @claude with an explicit prompt
- Claude opens PR
- Review / merge

### For operational drift
- Dashboard shows blockers and review queue
- You only intervene when:
  - a blocker appears
  - a PR needs approval
  - field naming changed

---

## Keep these decisions fixed
- GitHub Projects stays source of truth
- Discord never becomes source of truth
- Worker is read-only against GitHub in v1
- Slack-style chat commands are optional, not required
- Aim for zero daily maintenance beyond reviewing PRs