export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_ORG: string;
  GITHUB_PROJECT_NUMBER: string;
  DISCORD_DASHBOARD_WEBHOOK_URL: string;
  DISCORD_ALERTS_WEBHOOK_URL: string;
  DISCORD_DASHBOARD_MESSAGE_ID?: string;
}

type ScheduledController = {
  cron: string;
  scheduledTime: number;
};

type WorkItem = {
  id: string;
  kind: "issue" | "pr" | "draft";
  title: string;
  url: string;
  assignees: string[];
  status: string;
  area: string | null;
  nextStep: string | null;
  blockerReason: string | null;
  updatedAt: string;
};

type DashboardRun = {
  items: WorkItem[];
  content: string;
};

type WebhookValidationReason =
  | "missing"
  | "placeholder"
  | "invalid-url"
  | "wrong-host"
  | "wrong-path";

type WebhookValidation =
  | { ok: true }
  | { ok: false; reason: WebhookValidationReason; hint: string };

type AlertsWebhookValidation = WebhookValidation | { ok: true; note: string };

type ErrorResponseOptions = {
  env: Env;
  mode: "error" | "debug-error";
  status?: number;
  error: string;
};

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const DISCORD_MESSAGE_LIMIT = 1900;
const PRIORITY_STATUSES = ["これから", "作業中", "確認待ち", "困ってる", "完了", "未設定"] as const;
const SAFE_FALLBACK_STATUSES = new Set([400, 401, 403, 404]);
const REQUIRED_ENV_KEYS = [
  "GITHUB_TOKEN",
  "GITHUB_ORG",
  "GITHUB_PROJECT_NUMBER",
  "DISCORD_DASHBOARD_WEBHOOK_URL",
] as const;
const OPTIONAL_ENV_KEYS = ["DISCORD_ALERTS_WEBHOOK_URL", "DISCORD_DASHBOARD_MESSAGE_ID"] as const;
const GITHUB_REQUIRED_KEYS = ["GITHUB_TOKEN", "GITHUB_ORG", "GITHUB_PROJECT_NUMBER"] as const;
const PLACEHOLDER_MARKERS = [
  "REPLACE_WITH_",
  "REPLACE_",
  "_here",
  "your_",
  "WEBHOOK_ID",
  "WEBHOOK_TOKEN",
];
const DISCORD_WEBHOOK_HOSTS = new Set([
  "discord.com",
  "discordapp.com",
  "ptb.discord.com",
  "canary.discord.com",
]);

const PROJECT_QUERY = `
query ProjectItems($org: String!, $number: Int!, $cursor: String) {
  organization(login: $org) {
    projectV2(number: $number) {
      title
      items(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          updatedAt
          content {
            __typename
            ... on Issue {
              title
              url
              assignees(first: 10) { nodes { login } }
            }
            ... on PullRequest {
              title
              url
              assignees(first: 10) { nodes { login } }
            }
            ... on DraftIssue {
              title
            }
          }
          fieldValueByName(name: "Status") {
            __typename
            ... on ProjectV2ItemFieldSingleSelectValue { name }
          }
          area: fieldValueByName(name: "Area") {
            __typename
            ... on ProjectV2ItemFieldSingleSelectValue { name }
          }
          nextStep: fieldValueByName(name: "Next Step") {
            __typename
            ... on ProjectV2ItemFieldTextValue { text }
          }
          blockerReason: fieldValueByName(name: "Blocker Reason") {
            __typename
            ... on ProjectV2ItemFieldTextValue { text }
          }
        }
      }
    }
  }
}
`;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return PLACEHOLDER_MARKERS.some((marker) => trimmed.includes(marker));
}

function hasInternalSpaces(value: string | undefined): boolean {
  if (!value) return false;
  return value.includes(" ");
}

function validateDiscordWebhookUrl(value: string | undefined, label: string): WebhookValidation {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return {
      ok: false,
      reason: "missing",
      hint: `${label} is empty. Paste the Discord webhook URL into worker/.dev.vars (Discord channel → Edit Channel → Integrations → Webhooks → Copy Webhook URL).`,
    };
  }
  if (hasInternalSpaces(trimmed)) {
    return {
      ok: false,
      reason: "invalid-url",
      hint: `${label} contains spaces. This is typically a copy-paste error. Double-check the URL in worker/.dev.vars has no extra spaces.`,
    };
  }
  if (looksLikePlaceholder(trimmed)) {
    return {
      ok: false,
      reason: "placeholder",
      hint: `${label} still contains a placeholder value. Replace it with the real Discord webhook URL in worker/.dev.vars, then restart Wrangler.`,
    };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      reason: "invalid-url",
      hint: `${label} is not a parseable URL. Expected format: https://discord.com/api/webhooks/<id>/<token>`,
    };
  }
  if (!DISCORD_WEBHOOK_HOSTS.has(parsed.host)) {
    return {
      ok: false,
      reason: "wrong-host",
      hint: `${label} host should be discord.com (got ${parsed.host}). Expected format: https://discord.com/api/webhooks/<id>/<token>`,
    };
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  const webhookIndex = segments.indexOf("webhooks");
  if (webhookIndex === -1 || segments.length < webhookIndex + 3) {
    return {
      ok: false,
      reason: "wrong-path",
      hint: `${label} path should look like /api/webhooks/<id>/<token> (got ${parsed.pathname}).`,
    };
  }
  return { ok: true };
}

function describeAlertsWebhook(env: Env): AlertsWebhookValidation {
  const value = env.DISCORD_ALERTS_WEBHOOK_URL?.trim();
  if (!value) {
    return { ok: true, note: "DISCORD_ALERTS_WEBHOOK_URL not set; failure alerts are disabled" };
  }
  return validateDiscordWebhookUrl(value, "DISCORD_ALERTS_WEBHOOK_URL");
}

function describeGitHubError(status: number): string {
  switch (status) {
    case 401:
      return "GitHub GraphQL 401 (auth): GITHUB_TOKEN was rejected. Token may be missing scopes, expired, revoked, or still set to a placeholder. Replace it in worker/.dev.vars and restart Wrangler.";
    case 403:
      return "GitHub GraphQL 403 (permission): GITHUB_TOKEN authenticated but lacks required access. For org Projects the token must have read:project (and read:org / repo for linked items). If the org enforces SAML SSO, the token must also be SSO-authorized for that org.";
    case 404:
      return "GitHub GraphQL 404 (project lookup): project not found. Confirm GITHUB_ORG matches the org login exactly and GITHUB_PROJECT_NUMBER matches the Project V2 number shown in the Project URL.";
    default:
      return `GitHub GraphQL request failed: ${status}`;
  }
}

function normalizeItem(node: any): WorkItem | null {
  const content = node?.content;
  if (!content) return null;

  const kind =
    content.__typename === "Issue"
      ? "issue"
      : content.__typename === "PullRequest"
        ? "pr"
        : "draft";

  return {
    id: node.id,
    kind,
    title: content.title ?? "Untitled",
    url: content.url ?? "",
    assignees: content.assignees?.nodes?.map((n: any) => n.login) ?? [],
    status: node.fieldValueByName?.name ?? "未設定",
    area: node.area?.name ?? null,
    nextStep: node.nextStep?.text ?? null,
    blockerReason: node.blockerReason?.text ?? null,
    updatedAt: node.updatedAt,
  };
}

async function fetchProjectItems(env: Env): Promise<WorkItem[]> {
  let cursor: string | null = null;
  const items: WorkItem[] = [];

  while (true) {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "User-Agent": "masako-discord-progress-dashboard",
      },
      body: JSON.stringify({
        query: PROJECT_QUERY,
        variables: {
          org: env.GITHUB_ORG,
          number: Number(env.GITHUB_PROJECT_NUMBER),
          cursor,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(describeGitHubError(res.status));
    }

    const json = (await res.json()) as any;
    const project = json?.data?.organization?.projectV2;
    if (!project) {
      throw new Error(
        "GitHub GraphQL returned no project data. Confirm GITHUB_ORG and GITHUB_PROJECT_NUMBER point to a Project V2 the token can read.",
      );
    }

    const nodes = project.items?.nodes ?? [];
    for (const node of nodes) {
      const normalized = normalizeItem(node);
      if (normalized) items.push(normalized);
    }

    const pageInfo = project.items?.pageInfo;
    if (!pageInfo?.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return items;
}

function countByStatus(items: WorkItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

function groupByAssignee(items: WorkItem[]): Record<string, WorkItem[]> {
  const grouped: Record<string, WorkItem[]> = {};
  for (const item of items) {
    const key = item.assignees[0] ?? "Unassigned";
    grouped[key] ??= [];
    grouped[key].push(item);
  }
  return grouped;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  if (maxLength <= 1) return "…";
  return `${value.slice(0, maxLength - 1)}…`;
}

function formatItemLabel(item: WorkItem, maxLength = 110): string {
  const owner = item.assignees[0] ? ` / ${item.assignees[0]}` : "";
  return truncateText(`${item.title}${owner}`, maxLength);
}

function buildSection(title: string, lines: string[]): string[] {
  return ["", `**${title}**`, ...(lines.length ? lines : ["- なし"])];
}

function buildOverallSection(items: WorkItem[]): string[] {
  const counts = countByStatus(items);
  const lines = [`- 合計: ${items.length}`];

  for (const key of PRIORITY_STATUSES) {
    if (counts[key]) lines.push(`- ${key}: ${counts[key]}`);
  }

  return buildSection("全体", lines);
}

function buildBlockersSection(items: WorkItem[]): string[] {
  const blockers = items
    .filter((item) => item.status === "困ってる")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const lines = blockers.flatMap((item) => {
    const reason = item.blockerReason
      ? `  理由: ${truncateText(item.blockerReason, 120)}`
      : "  理由: 未記入";

    return [`- ${formatItemLabel(item)}`, reason];
  });

  return buildSection("困ってる一覧", lines);
}

function buildReviewsSection(items: WorkItem[]): string[] {
  const reviews = items
    .filter((item) => item.status === "確認待ち")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const lines = reviews.map((item) => `- ${item.kind.toUpperCase()}: ${formatItemLabel(item)}`);
  return buildSection("確認待ち", lines);
}

function buildNextActionsSection(items: WorkItem[]): string[] {
  const next = items
    .filter((item) => item.status !== "完了")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const lines = next.map((item) => {
    const nextStep = item.nextStep ? ` → 次: ${truncateText(item.nextStep, 80)}` : "";
    return `- ${formatItemLabel(item, 90)}${nextStep}`;
  });

  return buildSection("次に進めるもの", lines);
}

function buildOwnersSection(items: WorkItem[]): string[] {
  const assignees = groupByAssignee(items);
  const lines: string[] = [];

  for (const [name, owned] of Object.entries(assignees)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)) {
    const ownedCounts = countByStatus(owned);
    const parts = PRIORITY_STATUSES.filter((status) => ownedCounts[status]).map(
      (status) => `${status} ${ownedCounts[status]}`,
    );
    lines.push(`- ${name}: ${parts.join(" / ") || `${owned.length}件`}`);
  }

  return buildSection("担当者別", lines);
}

function joinWithLimit(lines: string[], maxLength: number): string {
  const output: string[] = [];
  let used = 0;

  for (const line of lines) {
    const addition = output.length === 0 ? line : `\n${line}`;
    if (used + addition.length <= maxLength) {
      output.push(line);
      used += addition.length;
      continue;
    }

    const remaining = maxLength - used;
    if (remaining <= 1) break;

    const shortened = truncateText(line, Math.max(1, remaining - (output.length === 0 ? 0 : 1)));
    output.push(shortened);
    break;
  }

  return output.join("\n");
}

function renderDashboard(items: WorkItem[]): string {
  const lines = [
    "**Masako Project Dashboard**",
    `Project items: ${items.length}`,
    ...buildOverallSection(items),
    ...buildBlockersSection(items),
    ...buildReviewsSection(items),
    ...buildNextActionsSection(items),
    ...buildOwnersSection(items),
    "",
    `_Updated: ${new Date().toISOString()}_`,
  ];

  return joinWithLimit(lines, DISCORD_MESSAGE_LIMIT);
}

function buildDebugSummary(items: WorkItem[]): Record<string, unknown> {
  const counts = countByStatus(items);
  const blockers = items.filter((item) => item.status === "困ってる").length;
  const reviews = items.filter((item) => item.status === "確認待ち").length;
  const nextItems = items
    .filter((item) => item.status !== "完了")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      status: item.status,
      assignee: item.assignees[0] ?? null,
      nextStep: item.nextStep,
    }));

  return {
    totalItems: items.length,
    counts,
    blockers,
    reviews,
    nextItems,
  };
}

function getDeliveryMode(env: Env): "fixed-message" | "webhook-post" {
  return env.DISCORD_DASHBOARD_MESSAGE_ID?.trim() ? "fixed-message" : "webhook-post";
}

async function sendWebhook(url: string, content: string): Promise<Response> {
  const webhookUrl = new URL(url);
  webhookUrl.searchParams.set("wait", "true");

  return fetch(webhookUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

function buildWebhookMessageEditUrl(webhookUrl: string, messageId: string): string | null {
  try {
    const url = new URL(webhookUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const webhookIndex = segments.indexOf("webhooks");

    if (webhookIndex === -1 || segments.length < webhookIndex + 3) {
      return null;
    }

    const webhookId = segments[webhookIndex + 1];
    const webhookToken = segments[webhookIndex + 2];
    url.pathname = `/api/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`;
    url.search = "";
    url.searchParams.set("wait", "true");
    return url.toString();
  } catch {
    return null;
  }
}

async function updateWebhookMessage(
  webhookUrl: string,
  messageId: string,
  content: string,
): Promise<Response | null> {
  const editUrl = buildWebhookMessageEditUrl(webhookUrl, messageId);
  if (!editUrl) return null;

  return fetch(editUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

function getMissingEnvKeys(env: Env): string[] {
  return REQUIRED_ENV_KEYS.filter((key) => !env[key]?.trim());
}

function getPresentOptionalEnvKeys(env: Env): string[] {
  return OPTIONAL_ENV_KEYS.filter((key) => Boolean(env[key]?.trim()));
}

function getPlaceholderEnvKeys(env: Env): string[] {
  return [...REQUIRED_ENV_KEYS, ...OPTIONAL_ENV_KEYS].filter((key) =>
    looksLikePlaceholder(env[key] as string | undefined),
  );
}

function getCheckStatusForKey(env: Env, key: string): string {
  const value = env[key as keyof Env];
  const trimmed = (value as string)?.trim() ?? "";

  if (!trimmed) {
    return "missing";
  }

  if (hasInternalSpaces(value as string)) {
    return "has_spaces";
  }

  if (looksLikePlaceholder(value as string)) {
    return "placeholder";
  }

  if (key.includes("WEBHOOK")) {
    const validation = validateDiscordWebhookUrl(value as string, key);
    if (!validation.ok) {
      return "invalid_url";
    }
  }

  return "present";
}

function buildHealthChecks(env: Env): Record<string, string> {
  const checks: Record<string, string> = {};

  for (const key of REQUIRED_ENV_KEYS) {
    checks[key] = getCheckStatusForKey(env, key);
  }

  const alertsWebhookValue = env.DISCORD_ALERTS_WEBHOOK_URL?.trim();
  if (alertsWebhookValue) {
    checks["DISCORD_ALERTS_WEBHOOK_URL"] = getCheckStatusForKey(env, "DISCORD_ALERTS_WEBHOOK_URL");
  } else {
    checks["DISCORD_ALERTS_WEBHOOK_URL"] = "disabled";
  }

  const dashboardMessageId = env.DISCORD_DASHBOARD_MESSAGE_ID?.trim();
  if (dashboardMessageId) {
    checks["DISCORD_DASHBOARD_MESSAGE_ID"] = "present";
  }

  return checks;
}

function assertGithubEnvUsable(env: Env): void {
  const missing: string[] = [];
  const placeholders: string[] = [];

  for (const key of GITHUB_REQUIRED_KEYS) {
    const value = env[key]?.trim();
    if (!value) {
      missing.push(key);
    } else if (looksLikePlaceholder(value)) {
      placeholders.push(key);
    }
  }

  if (missing.length) {
    throw new Error(
      `Missing required GitHub env vars: ${missing.join(", ")}. Edit worker/.dev.vars and restart Wrangler.`,
    );
  }

  if (placeholders.length) {
    throw new Error(
      `Placeholder values still in worker/.dev.vars for: ${placeholders.join(", ")}. Replace them with real values, then restart Wrangler.`,
    );
  }
}

function buildEnvDiagnostics(env: Env) {
  return {
    expectedLocalVarsFile: "worker/.dev.vars",
    requiredEnvKeys: [...REQUIRED_ENV_KEYS],
    missingEnvKeys: getMissingEnvKeys(env),
    placeholderEnvKeys: getPlaceholderEnvKeys(env),
    optionalEnvKeysPresent: getPresentOptionalEnvKeys(env),
    hasAlertsWebhook: Boolean(env.DISCORD_ALERTS_WEBHOOK_URL?.trim()),
    hasFixedMessageId: Boolean(env.DISCORD_DASHBOARD_MESSAGE_ID?.trim()),
    webhookValidation: {
      dashboard: validateDiscordWebhookUrl(
        env.DISCORD_DASHBOARD_WEBHOOK_URL,
        "DISCORD_DASHBOARD_WEBHOOK_URL",
      ),
      alerts: describeAlertsWebhook(env),
    },
  };
}

function buildHealthResponse(env: Env): Response {
  const checks = buildHealthChecks(env);
  const ok = Object.values(checks).every(
    (status) => status === "present" || status === "disabled",
  );

  const response: Record<string, unknown> = {
    ok,
    checks,
  };

  if (!ok) {
    const issues: string[] = [];

    for (const [key, status] of Object.entries(checks)) {
      if (status === "missing") {
        issues.push(`${key}: value is empty (add to worker/.dev.vars)`);
      } else if (status === "placeholder") {
        issues.push(`${key}: still contains placeholder text (replace in worker/.dev.vars)`);
      } else if (status === "has_spaces") {
        issues.push(`${key}: contains spaces (fix copy-paste error in worker/.dev.vars)`);
      } else if (status === "invalid_url") {
        issues.push(
          `${key}: not a valid Discord webhook URL (check format: https://discord.com/api/webhooks/...)`
        );
      }
    }

    if (issues.length > 0) {
      response.issues = issues;
      response.nextSteps = [
        "1. Open worker/.dev.vars",
        "2. Check each issue above",
        "3. Save the file",
        "4. Restart Wrangler (Ctrl+C then npm run dev)",
        "5. Re-run npm run health",
      ];
    }
  } else {
    response.nextSteps = ["All checks passed!", "Run: npm run preview"];
  }

  return new Response(JSON.stringify(response, null, 2), {
    status: ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
}

function buildLocalHelpResponse(): Response {
  return new Response(
    JSON.stringify(
      {
        ok: true,
        mode: "local-help",
        expectedLocalVarsFile: "worker/.dev.vars",
        endpoints: {
          healthz: "http://127.0.0.1:8787/healthz",
          preview: "http://127.0.0.1:8787/",
          debug: "http://127.0.0.1:8787/debug",
          scheduled: "http://127.0.0.1:8787/__scheduled?cron=*/5+*+*+*+*",
        },
        steps: [
          "Put local values in worker/.dev.vars",
          "Restart Wrangler after editing worker/.dev.vars",
          "Check /healthz first",
          "Check /debug second",
          "Trigger /__scheduled last",
        ],
      },
      null,
      2,
    ),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

function buildPreviewResponse(run: DashboardRun): Response {
  return new Response(
    JSON.stringify(
      {
        ok: true,
        mode: "preview",
        deliveryMode: "preview-only",
        items: run.items.length,
        contentLength: run.content.length,
        summary: buildDebugSummary(run.items),
        content: run.content,
      },
      null,
      2,
    ),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

function buildDebugResponse(env: Env, run: DashboardRun): Response {
  const diagnostics = buildEnvDiagnostics(env);
  return new Response(
    JSON.stringify(
      {
        ok: true,
        mode: "debug",
        deliveryMode: getDeliveryMode(env),
        ...diagnostics,
        items: run.items.length,
        contentLength: run.content.length,
        summary: buildDebugSummary(run.items),
        content: run.content,
      },
      null,
      2,
    ),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

function buildErrorResponse(options: ErrorResponseOptions): Response {
  const diagnostics = buildEnvDiagnostics(options.env);

  return new Response(
    JSON.stringify(
      {
        ok: false,
        mode: options.mode,
        error: options.error,
        ...diagnostics,
        nextChecks: [
          "Read the error string above; it now classifies GitHub auth (401) vs permission (403) vs project lookup (404)",
          "If webhookValidation.dashboard.ok is false, fix the Discord webhook URL before retrying /__scheduled",
          "Confirm worker/.dev.vars exists in the worker directory and has no placeholder values",
          "Restart Wrangler after editing worker/.dev.vars",
          "Check GET /healthz before retrying /debug or /__scheduled",
        ],
      },
      null,
      2,
    ),
    {
      status: options.status ?? 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function runDashboard(env: Env): Promise<DashboardRun> {
  assertGithubEnvUsable(env);

  const items = await fetchProjectItems(env);
  return {
    items,
    content: renderDashboard(items),
  };
}

async function notifyAlert(env: Env, message: string): Promise<void> {
  const url = env.DISCORD_ALERTS_WEBHOOK_URL?.trim();
  if (!url) return;

  const validation = validateDiscordWebhookUrl(url, "DISCORD_ALERTS_WEBHOOK_URL");
  if (!validation.ok) {
    console.error(`Skipping alert webhook: ${validation.hint}`);
    return;
  }

  try {
    await sendWebhook(url, message);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`Alert webhook send failed: ${detail}`);
  }
}

function shouldFallbackToWebhookPost(response: Response | null): boolean {
  if (!response) return true;
  return SAFE_FALLBACK_STATUSES.has(response.status);
}

async function publishDashboard(
  env: Env,
  content: string,
): Promise<{
  mode: "fixed-message" | "webhook-post";
  response: Response;
  fallbackReason: string | null;
}> {
  const validation = validateDiscordWebhookUrl(
    env.DISCORD_DASHBOARD_WEBHOOK_URL,
    "DISCORD_DASHBOARD_WEBHOOK_URL",
  );
  if (!validation.ok) {
    throw new Error(`Discord webhook unusable (${validation.reason}): ${validation.hint}`);
  }

  const messageId = env.DISCORD_DASHBOARD_MESSAGE_ID?.trim();

  if (messageId) {
    const editResponse = await updateWebhookMessage(
      env.DISCORD_DASHBOARD_WEBHOOK_URL,
      messageId,
      content,
    );

    if (editResponse?.ok) {
      return {
        mode: "fixed-message",
        response: editResponse,
        fallbackReason: null,
      };
    }

    if (!shouldFallbackToWebhookPost(editResponse)) {
      throw new Error(
        `Discord fixed-message update failed without safe fallback: ${editResponse?.status ?? "invalid webhook url"}`,
      );
    }
  }

  const postResponse = await sendWebhook(env.DISCORD_DASHBOARD_WEBHOOK_URL, content);
  return {
    mode: "webhook-post",
    response: postResponse,
    fallbackReason: messageId ? "fixed-message-update-failed" : "fixed-message-not-configured",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/local-help") {
      return buildLocalHelpResponse();
    }

    if (url.pathname === "/healthz") {
      return buildHealthResponse(env);
    }

    try {
      const run = await runDashboard(env);

      if (url.pathname === "/debug") {
        return buildDebugResponse(env, run);
      }

      return buildPreviewResponse(run);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      return buildErrorResponse({
        env,
        mode: url.pathname === "/debug" ? "debug-error" : "error",
        error: message,
      });
    }
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    try {
      const run = await runDashboard(env);
      const result = await publishDashboard(env, run.content);
      if (!result.response.ok) {
        throw new Error(`Discord dashboard delivery failed: ${result.response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown scheduled worker error";
      await notifyAlert(env, `Masako dashboard worker failed: ${message}`);
      throw error;
    }
  },
};
