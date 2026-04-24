# GitHub-Native Dashboard - Migration Checklist

## ✅ Implementation Complete

The GitHub-native dashboard system is ready to use. Follow this checklist to activate it.

## 🚀 Phase 1: Setup (Required)

### Step 1: Find Your Project Number
- [ ] Go to https://github.com/orgs/YOUR_ORG/projects
- [ ] Click your project
- [ ] Note the number from the URL: `projects/123` → **123**

### Step 2: Add Repository Secret
```bash
gh secret set GITHUB_PROJECT_NUMBER --body "123"
```
- [ ] Confirmed secret is set
- [ ] Can verify with: `gh secret list`

### Step 3: Test the Workflow
```bash
gh workflow run update-dashboard.yml
```
- [ ] Workflow triggered successfully
- [ ] Check status: `gh run list --workflow=update-dashboard.yml`

### Step 4: Verify Dashboard Created
```bash
gh issue list --label=dashboard
```
- [ ] Dashboard issue exists (or will be created on first run)
- [ ] Issue is labeled "dashboard"
- [ ] Issue shows progress information

### Step 5: Share with Team
- [ ] Share [DASHBOARD.md](./DASHBOARD.md) with team members
- [ ] Explain how to update task status in GitHub Project
- [ ] Explain how to check progress

## 🔧 Phase 2: Optional Customization

### Update Schedule
- [ ] Edit `.github/workflows/update-dashboard.yml`
- [ ] Change `cron: '0 9 * * *'` to desired time
- [ ] Reference: https://crontab.guru/

### For Organization-Level Projects
If project is at org level (not repo), you may need a custom token:

- [ ] Create fine-grained PAT: https://github.com/settings/tokens?type=beta
- [ ] Permissions: `read:org`, `read:project`, `issues:write`
- [ ] Add as secret: `gh secret set GH_TOKEN_DASHBOARD --body "ghp_xxxxx"`
- [ ] Update workflow to use it:
  ```yaml
  env:
    GH_TOKEN: ${{ secrets.GH_TOKEN_DASHBOARD }}
  ```

### Customize Dashboard Content
- [ ] Edit `.github/scripts/update-dashboard.js`
- [ ] Modify `renderDashboard()` function to add/remove sections
- [ ] Test manually: `gh workflow run update-dashboard.yml`

## 📋 Validation Checklist

### Project Structure
- [ ] `.github/workflows/update-dashboard.yml` exists
- [ ] `.github/scripts/update-dashboard.js` exists
- [ ] All documentation files present

### Project Configuration
- [ ] `GITHUB_PROJECT_NUMBER` is set in repository secrets
- [ ] GitHub Project has Status field
- [ ] Status field has values: これから, 作業中, 確認待ち, 困ってる, 完了

### Permissions
- [ ] Workflow has `issues: write` permission
- [ ] Workflow has `contents: read` permission
- [ ] Token can access the project (test with: `gh workflow run update-dashboard.yml`)

### Documentation
- [ ] [DASHBOARD.md](./DASHBOARD.md) is complete
- [ ] [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) is complete
- [ ] [CLAUDE.md](./CLAUDE.md) is updated
- [ ] Team knows where to find documentation

## 🧪 Testing

### Manual Test
```bash
# Trigger workflow
gh workflow run update-dashboard.yml

# Check run details
gh run list --workflow=update-dashboard.yml
gh run view <run-id>

# Find and view dashboard
gh issue list --label=dashboard
gh issue view <issue-number>
```

### Success Indicators
- ✅ Workflow completes without errors
- ✅ GitHub Issue is created/updated with dashboard
- ✅ Dashboard shows project title, total count, status breakdown
- ✅ Blockers section shows blocked tasks
- ✅ Next actions section shows upcoming work

### Common Issues

**Workflow doesn't run**
- Check: `GITHUB_PROJECT_NUMBER` is set
- Check: `.github/workflows/update-dashboard.yml` exists
- Check: Workflow syntax is valid

**"Project not found" error**
- Verify project number is correct
- For org projects, may need custom token

**Issue not updating**
- Check: Token has `issues:write` permission
- Check: Project number is accessible by token
- Check: No syntax errors in script

**Missing sections**
- Check: Required fields exist in GitHub Project
- Check: At least one task exists in each category

## 📚 Documentation Map

| Purpose | File |
|---------|------|
| User guide | [DASHBOARD.md](./DASHBOARD.md) |
| Setup details | [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) |
| Quick reference | [.github/DASHBOARD_QUICK_START.md](./.github/DASHBOARD_QUICK_START.md) |
| Architecture | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) |
| This checklist | [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) |

## 🔄 Maintenance

### Daily Operation
- Dashboard updates automatically at 9 AM UTC
- No manual maintenance needed
- Monitor blockers section for stuck tasks

### Monthly Review
- [ ] Check if sections are still relevant
- [ ] Update dashboard sections if needed
- [ ] Monitor GitHub Actions usage

### When Something Breaks
1. Check workflow run: `gh run view <run-id>`
2. Review error message
3. See troubleshooting in [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)
4. Or check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for risks & mitigation

## 🚦 Status Transition

Before Phase 1 completion:
- [ ] Disable or monitor Cloudflare Worker (still in `worker/` directory)
- [ ] Remove Discord webhook secrets if no longer needed
- [ ] Confirm team is using GitHub Project for updates

## 📝 Notes for Team

### When Updating Tasks
1. Open GitHub Project
2. Set task Status to one of: これから, 作業中, 確認待ち, 困ってる, 完了
3. If stuck, set Status to "困ってる" and fill "Blocker Reason"
4. Optionally add "Next Step" to guide others
5. Dashboard will reflect changes within 24 hours (or trigger manually)

### When Viewing Progress
1. Open dashboard issue: https://github.com/YOUR_ORG/YOUR_REPO/issues?labels=dashboard
2. Check Summary for overall progress
3. Review Blockers to identify what needs help
4. Check Next Actions for work coming up
5. See Recently Updated for latest changes

## ✨ Success!

If all items above are checked, your GitHub-native dashboard is:
- ✅ Installed
- ✅ Configured
- ✅ Tested
- ✅ Documented
- ✅ Ready for team use

---

**Next?** Share the dashboard with your team using [DASHBOARD.md](./DASHBOARD.md)!
