# Worker Quickstart

This Cloudflare Worker lives entirely under `worker/` so it stays isolated from the Expo / React Native app.

v1 reads GitHub Projects data and posts a Discord dashboard summary.
It does not write back to GitHub.
It does not add a database, queue, or bot runtime.

## Required secrets

Set these as Wrangler secrets for this Worker:

- `GITHUB_TOKEN`
- `GITHUB_ORG`
- `GITHUB_PROJECT_NUMBER`
- `DISCORD_DASHBOARD_WEBHOOK_URL`
- `DISCORD_ALERTS_WEBHOOK_URL`

Recommended GitHub token posture for v1:

- Use a token intended only for this dashboard worker.
- Keep GitHub access read-only.
- Limit the token to the minimum project and issue / pull request read access needed for your GitHub Projects query.

Note:
`ANTHROPIC_API_KEY` is used by the separate GitHub Action in `.github/workflows/claude-code.yml`.
It is not required by this Worker.

## Local setup

Run all Worker commands from the `worker/` directory:

```bash
cd worker
```

Install Wrangler if you do not already have it:

```bash
npx wrangler --version
```

Add secrets:

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put GITHUB_ORG
npx wrangler secret put GITHUB_PROJECT_NUMBER
npx wrangler secret put DISCORD_DASHBOARD_WEBHOOK_URL
npx wrangler secret put DISCORD_ALERTS_WEBHOOK_URL
```

## Local testing

Start the Worker with scheduled testing enabled:

```bash
cd worker
npx wrangler dev --test-scheduled
```

Trigger the cron handler locally:

```bash
curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"
```

Optional preview endpoint:

```bash
curl "http://localhost:8787/"
```

The preview endpoint returns the rendered dashboard payload without posting to Discord.
Only the scheduled handler posts to the Discord webhook.

## Deploy

Deploy from the `worker/` directory:

```bash
cd worker
npx wrangler deploy
```

## What v1 does

- Reads GitHub Projects data through the GitHub GraphQL API
- Renders a Discord-friendly dashboard summary
- Posts the summary to the dashboard webhook on a cron schedule
- Sends a failure alert to the alerts webhook if the scheduled run fails

## What v1 does not do

- It does not update GitHub Projects, issues, or pull requests
- It does not write data to a database
- It does not run inside the Expo app
- It does not move code into `app/`, `src/`, or other mobile app directories
- It does not maintain a full Discord bot architecture
