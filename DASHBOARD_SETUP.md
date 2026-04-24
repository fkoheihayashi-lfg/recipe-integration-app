# Progress Dashboard Setup Guide

The Progress Dashboard automatically updates a GitHub Issue with your project's status. It reads from GitHub Projects and displays everything in one convenient place—no Discord webhooks, no external services.

## ✨ Features

- **GitHub-native**: Uses GitHub Projects as the source of truth
- **Automatic updates**: Runs on a schedule (daily at 9 AM UTC)
- **No secrets required**: Uses the built-in GitHub Actions token for repo access
- **One command manual trigger**: `gh workflow run update-dashboard.yml`
- **Beginner-friendly**: See progress in a simple markdown format

## 🚀 Quick Setup

### 1. Set the Project Number

First, find your GitHub Project number:
1. Open your GitHub Projects (https://github.com/orgs/YOUR_ORG/projects)
2. Click on your project
3. Look at the URL: `https://github.com/orgs/YOUR_ORG/projects/123` → **number is `123`**

Add it as a repository secret:

```bash
# Via GitHub CLI
gh secret set GITHUB_PROJECT_NUMBER --body "123"

# Or via GitHub web interface:
# 1. Go to repository Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Name: GITHUB_PROJECT_NUMBER
# 4. Value: your project number
```

### 2. (Optional) Authenticate for Organization-Level Projects

If your GitHub Project is at the **organization level** (not repository level):

The built-in `GITHUB_TOKEN` in Actions may need additional permissions. You have two options:

**Option A: Use a Personal Access Token (recommended for org-level projects)**

```bash
# Create a fine-grained PAT with read:project and read:org permissions
# https://github.com/settings/tokens?type=beta

# Then add it as a repository secret
gh secret set GH_TOKEN_DASHBOARD --body "ghp_xxxxx"
```

Then update `.github/workflows/update-dashboard.yml` to use it:

```yaml
env:
  GH_TOKEN: ${{ secrets.GH_TOKEN_DASHBOARD }}
  # ... rest of env vars
```

**Option B: Stick with built-in token (works for repo-level projects)**

The default `github.token` has access to your repository and its projects. This works great if your dashboard project is at the repository level.

### 3. Verify Setup

Trigger the workflow manually to test:

```bash
gh workflow run update-dashboard.yml
```

Then check the progress:

```bash
gh run list --workflow=update-dashboard.yml
```

View the dashboard issue:

```bash
# Find the "Progress Dashboard" issue
gh issue list --label=dashboard
```

## 📊 What You'll See

The dashboard shows:

- **Summary**: Total tasks and count by status (これから, 作業中, 確認待ち, 困ってる, 完了)
- **🚫 Blockers**: Tasks marked as 困ってる (stuck) with their blocker reasons
- **👀 Waiting for Review**: Tasks marked as 確認待ち (review-waiting)
- **⭐ Next Actions**: Recently updated tasks that need work
- **📅 Recently Updated**: Last 10 updated items with dates

Example:

```
# Progress Dashboard
📊 **Last updated:** 2026-04-24T09:00:00.000Z

## Summary
- **Total tasks:** 15
- **これから:** 3
- **作業中:** 5
- **確認待ち:** 2
- **困ってる:** 1
- **完了:** 4

## 🚫 Blockers
- [Update authentication flow](https://github.com/...) / alice
  - 理由: Waiting for security review

...
```

## 🔄 How It Works

1. **GitHub Actions** runs on a schedule (daily at 9 AM UTC)
2. **Dashboard script** queries your GitHub Project via GraphQL
3. Script formats data into a markdown summary
4. Script finds or creates a GitHub Issue labeled `dashboard`
5. Issue is updated with the latest summary
6. **Done!** No Discord, no external service, just GitHub

## 🛠️ Customization

### Change the Schedule

Edit `.github/workflows/update-dashboard.yml`:

```yaml
on:
  schedule:
    # Change this cron expression
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
    # Other examples:
    # - cron: '0 */6 * * *'  # Every 6 hours
    # - cron: '0 9 * * 1-5'  # Weekdays at 9 AM
```

See [cron syntax](https://crontab.guru/) for more examples.

### Change the Issue Labeling

The dashboard issue is labeled with `dashboard`. To change:

Edit `.github/scripts/update-dashboard.js`, in the `findOrCreateDashboardIssue()` function:

```javascript
labels: ['dashboard'],  // Change here
```

### Customize Dashboard Content

Edit `.github/scripts/update-dashboard.js`, in the `renderDashboard()` function to add/remove sections.

## ❓ Troubleshooting

### Issue: "Project not found"

```
Error: Project V2 #123 not found in organization myorg
```

**Fix:**
1. Verify `GITHUB_PROJECT_NUMBER` is correct
2. For organization projects, ensure you have the right token set
3. Check that the token has `read:project` permissions

### Issue: "Unauthorized"

The token doesn't have permission. Check:
1. For repo projects: default `github.token` should work
2. For org projects: use a PAT with `read:org` and `read:project`
3. Token must have `issues:write` for updating the issue

### Issue: Dashboard issue not created

The token needs `issues:write` permission. The default `github.token` should have this. If using a PAT, ensure it includes this scope.

### Issue: Workflow doesn't run

1. Check `.github/workflows/update-dashboard.yml` exists
2. Verify the workflow file has no syntax errors:
   ```bash
   gh workflow list
   ```
3. Ensure `GITHUB_PROJECT_NUMBER` is set as a secret

## 📝 Project Field Requirements

The dashboard expects your GitHub Project to have these fields:

- **Status** (single select): Returns current status of the task
- **Area** (single select): Optional, for organizing by area
- **Next Step** (text): Optional, what to do next
- **Blocker Reason** (text): Optional, why it's blocked

Expected status values:

- これから (To Do)
- 作業中 (In Progress)
- 確認待ち (Waiting for Review)
- 困ってる (Blocked)
- 完了 (Done)

## 🔐 Security Notes

- **No Discord webhooks**: Eliminates a class of secrets to manage
- **GitHub-native**: Uses the repository's built-in authentication
- **No external services**: Everything stays within GitHub Actions
- **No database**: Pure computation, no persistent state outside GitHub

## 🤝 Next Steps

1. Set `GITHUB_PROJECT_NUMBER` as a secret
2. Run the workflow: `gh workflow run update-dashboard.yml`
3. Check the dashboard issue in your repo
4. (Optional) Customize the schedule or content

## 💡 Tips

- The dashboard issue is automatically created if it doesn't exist
- You can update it manually without affecting the automation
- Comments on the issue won't be lost—only the body is updated
- The workflow is designed to be idempotent (safe to run multiple times)

## 📚 References

- [GitHub Projects API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-with-projects)
- [GitHub Actions Cron Syntax](https://crontab.guru/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
