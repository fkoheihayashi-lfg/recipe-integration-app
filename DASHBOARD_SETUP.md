# Progress Dashboard Setup Guide

The Progress Dashboard automatically updates a GitHub Issue with your project's status. It reads from GitHub Projects and displays everything in one convenient place—no Discord webhooks, no external services.

## ✨ Features

- **GitHub-native**: Uses GitHub Projects as the source of truth
- **Automatic updates**: Runs on a schedule (daily at 9 AM UTC)
- **Supports all project types**: User-owned, organization, and repository projects
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

### 2. Create a Personal Access Token (PAT)

The dashboard requires a Personal Access Token to read GitHub Projects. This token needs permission to access both public and private projects.

**Create a fine-grained PAT:**

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Name: `dashboard-token`
4. Expiration: As needed (recommended: 90 days or "No expiration")
5. **Repository access**: Select "Only select repositories" → choose this repository
6. **Permissions** (under "Repository permissions"):
   - ✅ Issues: `read and write`
   - ✅ Projects: `read-only`
7. Click "Generate token"
8. Copy the token (starts with `ghp_`)

**Add the token as a repository secret:**

```bash
gh secret set DASHBOARD_TOKEN --body "ghp_xxxxx"
```

Or via GitHub web interface:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `DASHBOARD_TOKEN`
4. Value: Paste your token
5. Click "Add secret"

### 3. Verify Setup

Trigger the workflow manually to test:

```bash
gh workflow run update-dashboard.yml
```

Then check the progress:

```bash
gh run list --workflow=update-dashboard.yml
gh run view <run-id>  # Shows detailed logs if there's an error
```

View the dashboard issue:

```bash
# Find the "Progress Dashboard" issue
gh issue list --label=dashboard
gh issue view <issue-number>
```

**Success indicators:**
- ✅ Workflow run completes without errors
- ✅ GitHub Issue is created/updated with dashboard
- ✅ Dashboard shows your project title and task count

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

### Issue: "Could not resolve to a ProjectV2"

```
GraphQL error: Could not resolve to a ProjectV2 with the number
```

**Fix:**
1. Verify `PROJECT_NUMBER` is correct (check your GitHub Projects URL)
2. Ensure `DASHBOARD_TOKEN` is set (not the default `GITHUB_TOKEN`)
3. Token must have `read:project` permission
4. Token must have repository access to this repo

### Issue: "Unauthorized" or "403"

The token doesn't have permission. Check:
1. `DASHBOARD_TOKEN` is set in repository secrets
2. Token has `read:project` permission
3. Token has `issues:write` permission
4. Token is still valid (hasn't expired)
5. Token has access to this repository

**To fix:**
```bash
# Create a new token with proper permissions (see Step 2 above)
gh secret set DASHBOARD_TOKEN --body "ghp_xxxxx"
```

### Issue: "Project not found" error message

```
Project V2 #123 not found for owner fkoheihayashi-lfg
```

**Fix:**
1. Verify `PROJECT_NUMBER` is correct
2. Check your GitHub Projects URL: `github.com/users/USERNAME/projects/123`
3. Ensure the project is accessible with your token

### Issue: Workflow doesn't run

1. Check `.github/workflows/update-dashboard.yml` exists
2. Verify workflow file has no syntax errors:
   ```bash
   gh workflow list
   ```
3. Ensure `PROJECT_NUMBER` and `DASHBOARD_TOKEN` are set as secrets:
   ```bash
   gh secret list
   ```

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
- **GitHub-native**: Uses a Personal Access Token with minimal scopes
- **Limited permissions**: Token only has `read:project` and `issues:write`
- **No external services**: Everything stays within GitHub Actions
- **No database**: Pure computation, no persistent state outside GitHub
- **Token best practices**: 
  - Use fine-grained PATs (not classic tokens) when possible
  - Set repository-level access only (not all repositories)
  - Set short expiration (90 days recommended)
  - Rotate token regularly

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
