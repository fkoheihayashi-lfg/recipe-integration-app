# Quick Reference - GitHub Dashboard

## Files Created This Session

### Core Files (Ready to Use)
```
✅ .github/workflows/update-dashboard.yml       [32 lines]  Main workflow
✅ .github/scripts/update-dashboard.js         [398 lines] Dashboard generator
```

### Documentation
```
✅ DASHBOARD.md                        [114 lines] User guide
✅ DASHBOARD_SETUP.md                  [231 lines] Setup instructions
✅ .github/DASHBOARD_QUICK_START.md    [38 lines]  3-step setup
✅ IMPLEMENTATION_SUMMARY.md           [312 lines] Full architecture
✅ MIGRATION_CHECKLIST.md              [193 lines] Deployment checklist
✅ QUICK_REFERENCE.md                  [This file] Quick lookup
```

### Configuration Updated
```
✅ CLAUDE.md                           [Updated] New mission & rules
```

---

## Setup in 3 Commands

```bash
# 1. Set your GitHub Project number
gh secret set GITHUB_PROJECT_NUMBER --body "123"

# 2. Test it
gh workflow run update-dashboard.yml

# 3. View the dashboard
gh issue list --label=dashboard
```

---

## What Each File Does

| File | Purpose | Edit When |
|------|---------|-----------|
| `.github/workflows/update-dashboard.yml` | Triggers daily updates | Change schedule or permissions |
| `.github/scripts/update-dashboard.js` | Generates dashboard content | Customize sections or format |
| `DASHBOARD.md` | Explains the dashboard to users | Add/remove features |
| `DASHBOARD_SETUP.md` | Detailed setup guide | Troubleshoot or document changes |
| `.github/DASHBOARD_QUICK_START.md` | 3-step minimal setup | Update if setup process changes |
| `IMPLEMENTATION_SUMMARY.md` | Technical architecture | Reference for maintenance |
| `MIGRATION_CHECKLIST.md` | Deployment steps | Use for team onboarding |

---

## Testing Checklist

- [ ] Set `GITHUB_PROJECT_NUMBER` secret
- [ ] Run: `gh workflow run update-dashboard.yml`
- [ ] Check: `gh run list --workflow=update-dashboard.yml`
- [ ] Find: `gh issue list --label=dashboard`
- [ ] Verify dashboard issue shows progress data

---

## Key Commands

### Workflow Management
```bash
gh workflow run update-dashboard.yml              # Trigger manually
gh workflow list                                  # List all workflows
gh run list --workflow=update-dashboard.yml       # Show recent runs
gh run view <run-id>                             # View run details/logs
```

### Dashboard Management
```bash
gh issue list --label=dashboard                  # Find dashboard issue
gh issue view <issue-number>                     # View dashboard
gh issue edit <issue-number> --body "new body"   # Edit dashboard manually
```

### Secret Management
```bash
gh secret set GITHUB_PROJECT_NUMBER --body "123" # Set project number
gh secret list                                   # Verify secrets are set
gh secret remove GITHUB_PROJECT_NUMBER           # Delete secret
```

---

## Dashboard Updates

### Automatic
- **When**: Daily at 9 AM UTC
- **What**: Updates the GitHub Issue with latest project status
- **Where**: Issue labeled `dashboard`

### Manual
```bash
gh workflow run update-dashboard.yml
```

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Workflow doesn't run | Set `GITHUB_PROJECT_NUMBER` secret |
| "Project not found" | Verify project number is correct |
| Issue not updating | Check token has `issues:write` permission |
| Script fails | Check: `gh run view <run-id>` for logs |

See `DASHBOARD_SETUP.md` for detailed troubleshooting.

---

## Next Actions

### For Setup
1. Find project number: `https://github.com/orgs/YOUR_ORG/projects/123`
2. Add secret: `gh secret set GITHUB_PROJECT_NUMBER --body "123"`
3. Test: `gh workflow run update-dashboard.yml`

### For Team
1. Share `DASHBOARD.md` with team
2. Explain: "Update task status in GitHub Project, dashboard updates daily"
3. Show: Where to view dashboard (GitHub Issue, labeled `dashboard`)

### For Customization
1. Change schedule: Edit `.github/workflows/update-dashboard.yml`
2. Change content: Edit `.github/scripts/update-dashboard.js`
3. Test changes: `gh workflow run update-dashboard.yml`

---

## Architecture at a Glance

```
Every Day (9 AM UTC)
         │
         ↓
GitHub Actions Workflow
         │
         ├─ Authenticate with GITHUB_TOKEN
         ├─ Run Node.js script
         │
         └─ Script:
            ├─ Query GitHub Projects GraphQL API
            ├─ Format data into markdown
            ├─ Find/create GitHub Issue labeled "dashboard"
            ├─ Update issue body with dashboard
            └─ Done!
```

---

## Files Structure

```
.github/
├── workflows/
│   └── update-dashboard.yml          [Triggers the workflow]
├── scripts/
│   └── update-dashboard.js           [Generates dashboard]
└── DASHBOARD_QUICK_START.md          [Setup reference]

Root/
├── DASHBOARD.md                      [User guide]
├── DASHBOARD_SETUP.md                [Setup instructions]
├── IMPLEMENTATION_SUMMARY.md         [Architecture]
├── MIGRATION_CHECKLIST.md            [Deployment checklist]
├── QUICK_REFERENCE.md                [This file]
└── CLAUDE.md                         [Updated rules]
```

---

## Key Differences from Old System

| Aspect | Old (Discord) | New (GitHub) |
|--------|---------------|-------------|
| Dashboard Location | Discord channel | GitHub Issue |
| Update Method | Cloudflare Worker | GitHub Actions |
| Frequency | On demand | Daily auto + manual |
| Authentication | Discord token | GitHub token |
| External Services | Discord API | None |
| Reversibility | Hard | Easy |
| Team Visibility | Discord-only | GitHub-native |

---

## Support Map

| Question | Answer |
|----------|--------|
| "What is the dashboard?" | See `DASHBOARD.md` |
| "How do I set it up?" | See `DASHBOARD_SETUP.md` |
| "How does it work?" | See `IMPLEMENTATION_SUMMARY.md` |
| "What's the deployment process?" | See `MIGRATION_CHECKLIST.md` |
| "How do I customize it?" | See `DASHBOARD_SETUP.md` → Customization |
| "What if something breaks?" | See `DASHBOARD_SETUP.md` → Troubleshooting |

---

## One-Pager for Team

**What**: Automatic progress dashboard on GitHub
**Where**: GitHub Issue (labeled `dashboard`) in your repo
**When**: Updates daily at 9 AM UTC
**Why**: Single source of truth for project status
**How**: Reads from GitHub Project, no manual updates needed

**To report progress**: Update your task status in GitHub Project
**To view progress**: Open the dashboard issue in GitHub
**If stuck**: Mark status "困ってる" and fill "Blocker Reason" field

---

## Remember

✅ This is **Phase 1** - GitHub Projects → GitHub Issue only
✅ **No Discord webhooks** - Simpler, fewer dependencies
✅ **Fully documented** - Team can understand and maintain it
✅ **Completely reversible** - Can undo anytime
✅ **Beginner-friendly** - No external services to configure

---

*For complete details, see the appropriate documentation file above.*
*Questions? Check the relevant file in the Support Map section.*
