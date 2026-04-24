# 📊 Progress Dashboard

Welcome! This is your project's progress dashboard. It automatically updates every day with the latest status from GitHub Projects.

## 🎯 What Is This?

This dashboard shows:

- **Total tasks** in your project
- **Breakdown by status**: To Do, In Progress, Waiting for Review, Blocked, Done
- **Blockers**: What's stuck and why
- **Reviews**: What's waiting for approval
- **Next actions**: What needs to be done next
- **Recent updates**: What changed recently

All data comes directly from your GitHub Project—no Discord, no external services, just GitHub.

## 📍 Where Is It?

The dashboard lives in a **GitHub Issue** labeled `dashboard`. Find it here:

```
https://github.com/YOUR_ORG/YOUR_REPO/issues?labels=dashboard
```

Or search for "Progress Dashboard" in your Issues.

## 🔄 How Often Does It Update?

The dashboard updates **automatically once per day** at 9 AM UTC.

You can also trigger an update manually:

```bash
gh workflow run update-dashboard.yml
```

Check the status:

```bash
gh run list --workflow=update-dashboard.yml
```

## 📋 How to Use It

### For Team Members

1. **Check progress**: Open the dashboard issue anytime to see current status
2. **Report blockers**: If you're stuck, update your task's status to "困ってる" (Blocked) and fill in the "Blocker Reason" field
3. **Request review**: Set status to "確認待ち" (Waiting for Review) when ready
4. **Update next steps**: Fill in the "Next Step" field to guide others

### For Project Leads

1. **Monitor blockers**: Review the "🚫 Blockers" section regularly
2. **Check reviews**: See the "👀 Waiting for Review" section
3. **Track progress**: Watch the status counts to see velocity
4. **Make decisions**: Use the dashboard to identify bottlenecks

## 🤔 What If Something Is Wrong?

### Dashboard shows old data

The dashboard updates once per day. If you just updated a task, wait for the next automatic run, or:

```bash
gh workflow run update-dashboard.yml
```

### A task is missing from the dashboard

Make sure it's in your GitHub Project. Tasks must be in the Project to appear.

### Status values are wrong

Check that your Project has these fields:
- **Status** (should be one of: これから, 作業中, 確認待ち, 困ってる, 完了)
- **Assignee**
- **Area** (optional)
- **Next Step** (optional, text field)
- **Blocker Reason** (optional, text field)

### Workflow not running

Check that:
1. `.github/workflows/update-dashboard.yml` exists
2. `GITHUB_PROJECT_NUMBER` is set in repository secrets
3. The workflow has permission to read Projects and write to Issues

See [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) for detailed setup instructions.

## 🎓 Learning More

- **Setup details**: Read [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)
- **GitHub Projects docs**: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- **GitHub Actions docs**: https://docs.github.com/en/actions

## 💡 Quick Tips

- Dashboards are read-only from the GitHub Actions side—you can still comment and edit the issue normally
- Your Project is the source of truth; the dashboard just displays it
- No secrets are exposed; everything uses GitHub's built-in authentication
- The workflow is safe to run multiple times (it's idempotent)

## 🚀 Next Steps

1. Set up your project if you haven't already (see [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md))
2. Add tasks to your GitHub Project
3. Set status, assignee, and other fields
4. Watch the dashboard update automatically

---

**Questions or issues?** See the troubleshooting section in [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md).
