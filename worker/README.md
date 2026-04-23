# Quickstart

## Required secrets
- GITHUB_TOKEN
- GITHUB_ORG
- GITHUB_PROJECT_NUMBER
- DISCORD_DASHBOARD_WEBHOOK_URL
- DISCORD_ALERTS_WEBHOOK_URL
- ANTHROPIC_API_KEY

## Local test
1. Install Wrangler
2. Set local secrets
3. Run:
   - `wrangler dev --test-scheduled`
4. Test:
   - `curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"`

## Deploy
- `wrangler deploy`

## Notes
- v1 posts a dashboard summary to Discord
- v2 should switch to editing a fixed message instead of posting a new one each time