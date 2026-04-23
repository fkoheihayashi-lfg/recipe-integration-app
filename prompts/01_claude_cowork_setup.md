# Prompt — Claude Cowork setup operator

Goal:
Set up the repo and infra for a Discord progress dashboard with minimal manual work.

Context:
- GitHub Projects is the source of truth
- Discord is read-only dashboard in v1
- Cloudflare Worker does the sync
- Use the existing repo structure if possible
- Keep v1 read-only against GitHub
- Keep the architecture lightweight and reversible

Tasks:
1. Inspect the repo and detect the best place for a Cloudflare Worker-based dashboard sync package.
2. If no suitable package exists, create a small isolated directory for the Worker.
3. Add the provided Worker scaffold and adapt naming to the repo.
4. Add a CLAUDE.md if missing, or merge the provided rules safely.
5. Add the provided GitHub Action workflow for @claude-driven implementation.
6. Create a short README section explaining:
   - required secrets
   - how to deploy
   - how to test locally
7. Open a PR with a clean summary and risks.

Constraints:
- Do not redesign the entire repo.
- Do not add databases in v1.
- Do not add unnecessary frameworks.
- Prefer TypeScript and fetch.
- Keep changes small and reviewable.