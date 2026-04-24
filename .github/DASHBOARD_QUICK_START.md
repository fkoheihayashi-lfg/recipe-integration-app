# Dashboard Quick Start

## 1️⃣ Set Your Project Number

Find your GitHub Project number:
- Go to https://github.com/orgs/YOUR_ORG/projects
- Click your project
- URL shows: `https://github.com/orgs/YOUR_ORG/projects/123`
- Number = `123`

Add as secret:

```bash
gh secret set GITHUB_PROJECT_NUMBER --body "123"
```

## 2️⃣ Test the Workflow

```bash
gh workflow run update-dashboard.yml
gh run list --workflow=update-dashboard.yml
```

## 3️⃣ Find Your Dashboard

```bash
gh issue list --label=dashboard
```

Or visit: `https://github.com/YOUR_ORG/YOUR_REPO/issues?labels=dashboard`

## 4️⃣ Done!

Your dashboard will update automatically every day at 9 AM UTC.

---

**Need help?** See [DASHBOARD_SETUP.md](../DASHBOARD_SETUP.md) for detailed instructions.
