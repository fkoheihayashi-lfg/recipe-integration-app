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

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const REQUIRED_ENV_KEYS = [
  "GITHUB_TOKEN",
  "GITHUB_ORG",
  "GITHUB_PROJECT_NUMBER",
  "DISCORD_DASHBOARD_WEBHOOK_URL",
] as const;

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
      throw new Error(`GitHub GraphQL request failed: ${res.status}`);
    }

    const json = (await res.json()) as any;
    const project = json?.data?.organization?.projectV2;
    if (!project) {
      throw new Error("Project not found or query returned no data.");
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

function renderDashboard(items: WorkItem[]): string {
  const counts = countByStatus(items);
  const assignees = groupByAssignee(items);
  const blockers = items.filter((i) => i.status === "困ってる").slice(0, 8);
  const reviews = items.filter((i) => i.status === "確認待ち").slice(0, 8);
  const next = items
    .filter((i) => i.status !== "完了")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  const lines: string[] = [];
  lines.push("**Masako Project Dashboard**");
  lines.push("");
  lines.push("**全体**");
  for (const key of ["これから", "作業中", "確認待ち", "困ってる", "完了", "未設定"]) {
    if (counts[key]) lines.push(`- ${key}: ${counts[key]}`);
  }

  lines.push("");
  lines.push("**担当者別**");
  for (const [name, owned] of Object.entries(assignees).slice(0, 10)) {
    const ownedCounts = countByStatus(owned);
    const parts = Object.entries(ownedCounts).map(([status, n]) => `${status} ${n}`);
    lines.push(`- ${name}: ${parts.join(" / ")}`);
  }

  lines.push("");
  lines.push("**困ってる一覧**");
  if (!blockers.length) {
    lines.push("- なし");
  } else {
    for (const item of blockers) {
      lines.push(`- ${item.title}${item.assignees[0] ? ` / ${item.assignees[0]}` : ""}`);
      if (item.blockerReason) lines.push(`  理由: ${item.blockerReason}`);
    }
  }

  lines.push("");
  lines.push("**確認待ち**");
  if (!reviews.length) {
    lines.push("- なし");
  } else {
    for (const item of reviews) {
      lines.push(`- ${item.kind.toUpperCase()}: ${item.title}`);
    }
  }

  lines.push("");
  lines.push("**最近動いたもの**");
  for (const item of next) {
    lines.push(`- ${item.title}${item.nextStep ? ` → 次: ${item.nextStep}` : ""}`);
  }

  lines.push("");
  lines.push(`_Updated: ${new Date().toISOString()}_`);
  return lines.join("\n").slice(0, 1900);
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

function buildPreviewResponse(items: WorkItem[], content: string): Response {
  return new Response(
    JSON.stringify(
      {
        ok: true,
        mode: "preview",
        items: items.length,
        content,
      },
      null,
      2,
    ),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function runDashboard(env: Env): Promise<{ items: WorkItem[]; content: string }> {
  const missing = getMissingEnvKeys(env);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const items = await fetchProjectItems(env);
  return {
    items,
    content: renderDashboard(items),
  };
}

async function notifyAlert(env: Env, message: string): Promise<void> {
  if (!env.DISCORD_ALERTS_WEBHOOK_URL?.trim()) return;
  await sendWebhook(env.DISCORD_ALERTS_WEBHOOK_URL, message);
}

async function publishDashboard(
  env: Env,
  content: string,
): Promise<{ mode: "fixed-message" | "webhook-post"; response: Response }> {
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
      };
    }
  }

  const postResponse = await sendWebhook(env.DISCORD_DASHBOARD_WEBHOOK_URL, content);
  return {
    mode: "webhook-post",
    response: postResponse,
  };
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    try {
      const { items, content } = await runDashboard(env);
      return buildPreviewResponse(items, content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      return new Response(JSON.stringify({ ok: false, error: message }, null, 2), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    try {
      const { content } = await runDashboard(env);
      const result = await publishDashboard(env, content);
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
