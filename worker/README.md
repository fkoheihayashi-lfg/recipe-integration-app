# Worker Quickstart

This Cloudflare Worker lives entirely under `worker/` so it stays isolated from the Expo / React Native app.

Phase 1 rules:

- GitHub Projects stays the source of truth
- Discord stays display-only
- GitHub access stays read-only
- No database, queue, or full bot runtime is added

## Required secrets

Set these Wrangler secrets for this Worker:

- `GITHUB_TOKEN`
- `GITHUB_ORG`
- `GITHUB_PROJECT_NUMBER`
- `DISCORD_DASHBOARD_WEBHOOK_URL`
- `DISCORD_ALERTS_WEBHOOK_URL`

Optional fixed-message setting:

- `DISCORD_DASHBOARD_MESSAGE_ID`

Secret summary:

- `GITHUB_TOKEN`: read-only token for GitHub GraphQL project reads
- `GITHUB_ORG`: GitHub organization login that owns the project
- `GITHUB_PROJECT_NUMBER`: GitHub Project V2 number
- `DISCORD_DASHBOARD_WEBHOOK_URL`: Discord webhook for dashboard delivery
- `DISCORD_ALERTS_WEBHOOK_URL`: Discord webhook for failure alerts
- `DISCORD_DASHBOARD_MESSAGE_ID`: optional fixed dashboard message ID for in-place updates

Recommended GitHub token posture for v1:

- Use a token intended only for this dashboard worker
- Keep GitHub access read-only
- Limit the token to the minimum project and issue / pull request read access needed for your GitHub Projects query

Note:
`ANTHROPIC_API_KEY` is used by the separate GitHub Action in `.github/workflows/claude-code.yml`.
It is not required by this Worker.

## Local setup

Run all Worker commands from the `worker/` directory:

```bash
cd worker
```

Check Wrangler:

```bash
npx wrangler --version
```

Local env file:

- Local Wrangler development reads `worker/.dev.vars`
- The file must live inside the `worker/` folder, next to `wrangler.toml`
- If you edit `worker/.dev.vars`, stop Wrangler and start it again so the new values are loaded

Safe starter file:

```bash
cp .dev.vars.example .dev.vars
```

Add secrets:

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put GITHUB_ORG
npx wrangler secret put GITHUB_PROJECT_NUMBER
npx wrangler secret put DISCORD_DASHBOARD_WEBHOOK_URL
npx wrangler secret put DISCORD_ALERTS_WEBHOOK_URL
npx wrangler secret put DISCORD_DASHBOARD_MESSAGE_ID
```

If you want fixed-message mode, `DISCORD_DASHBOARD_MESSAGE_ID` must be the ID of an existing Discord message created by the same webhook in `DISCORD_DASHBOARD_WEBHOOK_URL`.
If it is missing or empty, the worker uses the normal webhook post flow.
If it is set but points to an invalid or inaccessible message, the worker safely falls back to a new webhook post.

Example `worker/.dev.vars` shape with placeholders only:

```dotenv
GITHUB_TOKEN=github_token_here
GITHUB_ORG=your_github_org
GITHUB_PROJECT_NUMBER=123
DISCORD_DASHBOARD_WEBHOOK_URL=https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
DISCORD_ALERTS_WEBHOOK_URL=https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
DISCORD_DASHBOARD_MESSAGE_ID=
```

## Local testing

Start the Worker with scheduled testing enabled:

```bash
cd worker
npm run dev
```

Trigger the cron handler locally:

```bash
npm run scheduled
```

Preview the current dashboard without posting to Discord:

```bash
npm run preview
```

Health check without calling GitHub or Discord:

```bash
npm run health
```

Debug view with fetched GitHub data but no Discord side effects:

```bash
npm run debug
```

Local help endpoint:

```bash
npm run local-help
```

`/` returns a preview payload with the rendered dashboard and a short summary.
`/healthz` only checks configuration.
`/debug` fetches GitHub data and returns a more detailed JSON payload for troubleshooting.
`/local-help` returns the local test order and the expected file path for `.dev.vars`.
Only the scheduled handler posts to Discord.

Recommended local test order:

1. `npm run dev`
2. In a second terminal: `npm run health`
3. If `ok` is `true`, run `npm run debug`
4. If `/debug` looks correct, run `npm run scheduled`

What `/healthz` tells you:

- Status of each required env var: `present`, `missing`, `placeholder`, `has_spaces`, or `invalid_url`
- Specific issues that need fixing
- Step-by-step next steps to resolve problems
- The expected local env file path

Validation detects:

- Missing values (empty strings)
- Placeholder text like `REPLACE_WITH_`, `your_`, `WEBHOOK_ID`
- Invalid URL syntax
- URLs with spaces (common copy-paste errors)
- Wrong Discord webhook host or path format

The `/healthz` endpoint returns clear, actionable feedback for each issue without exposing secret values.

Restart rule:

- After any change to `worker/.dev.vars`, stop the current Wrangler process and run `npm run dev` again

If localhost refuses connection:

- Make sure `npm run dev` is still running in another terminal
- Use `127.0.0.1` instead of `localhost`
- Confirm you are in the `worker/` directory, not the repo root
- Re-run `npm run dev` after editing `worker/.dev.vars`
- If port `8787` is busy, stop the old Wrangler process before retrying

## Deploy

Deploy from the `worker/` directory:

```bash
cd worker
npx wrangler deploy
```

## Delivery modes

Fixed-message mode:

- If `DISCORD_DASHBOARD_MESSAGE_ID` is set, the worker first tries to edit that message in place
- If the edit succeeds, the dashboard stays in one fixed Discord message

Fallback mode:

- If `DISCORD_DASHBOARD_MESSAGE_ID` is not set, the worker posts a new dashboard message on each scheduled run
- If fixed-message editing fails with an invalid target style error such as `400`, `401`, `403`, or `404`, the worker falls back to a new webhook post
- If Discord returns a non-fallback-safe error such as rate limiting or server failure, the worker does not create a duplicate post and instead fails the run

## Dashboard output

The rendered dashboard prioritizes:

- overall counts
- blockers
- review waiting
- next actionable items
- a short owner summary

The worker trims long content to stay within Discord message limits.

## What v1 does

- Reads GitHub Projects data through the GitHub GraphQL API
- Renders a Discord-friendly dashboard summary
- Posts or updates the dashboard on a cron schedule
- Sends a failure alert to the alerts webhook if the scheduled run fails
- Keeps normal HTTP requests preview-safe and side-effect free

## What v1 does not do

- It does not update GitHub Projects, issues, or pull requests
- It does not write data to a database
- It does not run inside the Expo app
- It does not move code into `app/`, `src/`, or other mobile app directories
- It does not maintain a full Discord bot architecture
