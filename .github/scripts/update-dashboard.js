#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

const GITHUB_API_URL = 'https://api.github.com';
const PRIORITY_STATUSES = ['これから', '作業中', '確認待ち', '困ってる', '完了'];

const env = {
  token: process.env.GH_TOKEN,
  org: process.env.GITHUB_ORG,
  repo: process.env.GITHUB_REPO,
  projectNumber: process.env.GITHUB_PROJECT_NUMBER,
};

if (!env.token) {
  console.error('Error: GH_TOKEN environment variable not set');
  process.exit(1);
}

if (!env.org || !env.repo) {
  console.error('Error: GITHUB_ORG and GITHUB_REPO environment variables not set');
  process.exit(1);
}

if (!env.projectNumber) {
  console.error(
    'Error: GITHUB_PROJECT_NUMBER environment variable not set. ' +
      'Set it in repository secrets or pass it as an environment variable.'
  );
  process.exit(1);
}

// GraphQL query to fetch project items
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
              number
              assignees(first: 10) { nodes { login } }
            }
            ... on PullRequest {
              title
              url
              number
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

function graphqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Authorization: `Bearer ${env.token}`,
        'User-Agent': 'github-progress-dashboard',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            reject(new Error(`GraphQL error: ${JSON.stringify(parsed.errors)}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function makeRestRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.token}`,
        'User-Agent': 'github-progress-dashboard',
        Accept: 'application/vnd.github.v3+json',
      },
    };

    let reqBody = null;
    if (body) {
      reqBody = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(reqBody);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

async function fetchProjectItems() {
  const items = [];
  let cursor = null;

  while (true) {
    const response = await graphqlRequest(PROJECT_QUERY, {
      org: env.org,
      number: Number(env.projectNumber),
      cursor,
    });

    const projectData = response?.data?.organization?.projectV2;
    if (!projectData) {
      throw new Error(
        `Project V2 #${env.projectNumber} not found in organization ${env.org}. ` +
          'Check GITHUB_ORG and GITHUB_PROJECT_NUMBER.'
      );
    }

    const nodes = projectData.items?.nodes ?? [];
    for (const node of nodes) {
      const content = node?.content;
      if (!content) continue;

      const kind =
        content.__typename === 'Issue'
          ? 'issue'
          : content.__typename === 'PullRequest'
            ? 'pr'
            : 'draft';

      items.push({
        id: node.id,
        kind,
        title: content.title ?? 'Untitled',
        url: content.url ?? '',
        number: content.number ?? null,
        assignees: content.assignees?.nodes?.map((n) => n.login) ?? [],
        status: node.fieldValueByName?.name ?? '未設定',
        area: node.area?.name ?? null,
        nextStep: node.nextStep?.text ?? null,
        blockerReason: node.blockerReason?.text ?? null,
        updatedAt: node.updatedAt,
      });
    }

    const pageInfo = projectData.items?.pageInfo;
    if (!pageInfo?.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  return items;
}

function countByStatus(items) {
  const counts = {};
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}

function truncateText(value, maxLength) {
  if (value.length <= maxLength) return value;
  if (maxLength <= 1) return '…';
  return `${value.slice(0, maxLength - 1)}…`;
}

function formatItemLabel(item, maxLength = 100) {
  const owner = item.assignees[0] ? ` / ${item.assignees[0]}` : '';
  const label = `${item.title}${owner}`;
  const truncated = truncateText(label, maxLength);

  if (item.url) {
    return `[${truncated}](${item.url})`;
  }
  return truncated;
}

function buildSection(title, lines) {
  return ['', `## ${title}`, ...(lines.length ? lines : ['- *なし*'])];
}

function renderDashboard(items) {
  const counts = countByStatus(items);
  const lines = [
    '# Progress Dashboard',
    `📊 **Last updated:** ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- **Total tasks:** ${items.length}`,
  ];

  for (const status of PRIORITY_STATUSES) {
    if (counts[status]) {
      lines.push(`- **${status}:** ${counts[status]}`);
    }
  }

  // Blockers section
  const blockers = items
    .filter((item) => item.status === '困ってる')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  if (blockers.length > 0) {
    const blockerLines = blockers.flatMap((item) => {
      const reason = item.blockerReason
        ? `- 理由: ${truncateText(item.blockerReason, 100)}`
        : '- 理由: 未記入';
      return ['- ' + formatItemLabel(item, 80), reason];
    });
    lines.push(...buildSection('🚫 Blockers', blockerLines));
  }

  // Review waiting section
  const reviews = items
    .filter((item) => item.status === '確認待ち')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  if (reviews.length > 0) {
    const reviewLines = reviews.map((item) => `- ${item.kind.toUpperCase()}: ${formatItemLabel(item, 80)}`);
    lines.push(...buildSection('👀 Waiting for Review', reviewLines));
  }

  // Next actions
  const next = items
    .filter((item) => item.status !== '完了')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  if (next.length > 0) {
    const nextLines = next.map((item) => {
      const nextStep = item.nextStep ? ` → ${truncateText(item.nextStep, 60)}` : '';
      return `- ${formatItemLabel(item, 70)}${nextStep}`;
    });
    lines.push(...buildSection('⭐ Next Actions', nextLines));
  }

  // Recently updated
  const recent = items
    .filter((item) => item.status !== '完了')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 10);

  if (recent.length > 0) {
    const recentLines = recent.map((item) => {
      const updated = new Date(item.updatedAt).toLocaleDateString();
      return `- ${updated}: ${formatItemLabel(item, 70)}`;
    });
    lines.push(...buildSection('📅 Recently Updated', recentLines));
  }

  lines.push('', '---', '', '💡 **How to use this dashboard:**', '1. Check the summary for overall progress', '2. Review blockers and help if needed', '3. See what needs review or action next', '4. Updates automatically once per day');

  return lines.join('\n');
}

async function findOrCreateDashboardIssue() {
  // Search for existing dashboard issue
  const searchPath = `/repos/${env.org}/${env.repo}/issues?labels=dashboard&state=all`;
  const searchResponse = await makeRestRequest('GET', searchPath);

  if (searchResponse.status === 200 && Array.isArray(searchResponse.data)) {
    for (const issue of searchResponse.data) {
      if (issue.title === 'Progress Dashboard' && issue.state === 'open') {
        return issue.number;
      }
    }
  }

  // Create new dashboard issue if not found
  console.log('Creating new Progress Dashboard issue...');
  const createPath = `/repos/${env.org}/${env.repo}/issues`;
  const createBody = {
    title: 'Progress Dashboard',
    body: '# Progress Dashboard\n\n*Loading...*',
    labels: ['dashboard'],
  };

  const createResponse = await makeRestRequest('POST', createPath, createBody);
  if (createResponse.status === 201) {
    return createResponse.data.number;
  }

  throw new Error(`Failed to create dashboard issue: ${JSON.stringify(createResponse)}`);
}

async function updateDashboardIssue(issueNumber, content) {
  const updatePath = `/repos/${env.org}/${env.repo}/issues/${issueNumber}`;
  const updateBody = { body: content };

  const updateResponse = await makeRestRequest('PATCH', updatePath, updateBody);
  if (updateResponse.status !== 200) {
    throw new Error(`Failed to update issue #${issueNumber}: ${JSON.stringify(updateResponse)}`);
  }

  return updateResponse.data;
}

async function main() {
  try {
    console.log('📡 Fetching project items...');
    const items = await fetchProjectItems();
    console.log(`✓ Found ${items.length} items`);

    console.log('🎨 Rendering dashboard...');
    const dashboardContent = renderDashboard(items);

    console.log('🔍 Finding or creating dashboard issue...');
    const issueNumber = await findOrCreateDashboardIssue();
    console.log(`✓ Using issue #${issueNumber}`);

    console.log('💾 Updating dashboard issue...');
    await updateDashboardIssue(issueNumber, dashboardContent);
    console.log(`✓ Updated issue #${issueNumber}`);

    console.log(`\n✅ Dashboard updated successfully!`);
    console.log(`📍 View it at: https://github.com/${env.org}/${env.repo}/issues/${issueNumber}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
