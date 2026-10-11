#!/usr/bin/env node
// Dependabot auto-merge gate. Enables auto-merge only for low-risk updates
// whose releases are all at least
// MIN_AGE_DAYS old. Mirrors the old Renovate minimumReleaseAge policy:
//   - development deps: auto-merge any non-major version
//   - production deps: auto-merge patch only
//   - github-actions: auto-merge any non-major version
//   - security advisory PRs: auto-merge regardless of version or release age
//   - an on-hold label always blocks auto-merge
//   - a check that is failing does block auto-merge, because most of these
//     repos now require a pull request but not a green one, so `gh pr merge
//     --auto` would otherwise merge the moment it is enabled. Three kinds of
//     failure are exempt, because none says anything about the bump: jobs that
//     never started because the account's Actions minutes ran out, checks that
//     are already red on the base branch before the PR, and a Vercel commit
//     status refusing to build on the free plan
//
// Runs from the base branch's checkout via pull_request_target, so only
// trusted code (this repo's own script) executes.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIN_AGE_DAYS = Number(process.env.MIN_AGE_DAYS ?? 3);
// Set REQUIRE_GREEN_CHECKS=false only where branch protection already waits on CI.
const requireGreenChecks = () => (process.env.REQUIRE_GREEN_CHECKS ?? 'true') !== 'false';
// Peer-dependency-sensitive packages always get a human, even on a patch and
// even when the PR is a security advisory. Ported from the Renovate
// "core runtime (manual review)" rule when Renovate was dropped, because one
// bump in this set broke a peer-dep tree and a TypeScript build.
// Override with MANUAL_REVIEW_PACKAGES=react,next (empty string allows all).
const MANUAL_REVIEW_PACKAGES = new Set(
  (process.env.MANUAL_REVIEW_PACKAGES ??
    'react,react-dom,@types/react,@types/react-dom,next,typescript,@react-three/fiber,@react-three/drei,@react-three/postprocessing,three,@types/three')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
);
const prUrl = process.argv[2];
const dryRun = !!process.env.PR_DRY_RUN;

function gh(args) {
  return execSync(`gh ${args}`, { encoding: 'utf8', env: process.env }).trim();
}

function readFileSafe(relativePath, fallback) {
  try {
    return readFileSync(join(process.cwd(), relativePath), 'utf8');
  } catch {
    return fallback;
  }
}

function versionOf(value) {
  return value.trim().replace(/[.\s]+$/g, '');
}

export function parseUpdates(body) {
  const updates = [];
  const linkTableRe = /^\| \[([^\]]+)\]\([^)]*\) \| ([\w.+-]+) \| ([\w.+-]+) \|$/gm;
  const plainTableRe = /^\| ([^|[\]]+) \| ([\w.+-]+) \| ([\w.+-]+) \|$/gm;
  const singleRe = /\[([^\]]+)\]\([^)]*\) from ([\w.+-]+) to ([\w.+-]+)/g;
  const pipRe = /Updates:?\s+([\w.-]+) from ([\w.+-]+) to ([\w.+-]+)/g;
  const backtickRe = /Updates?\s+`([^`]+)` from ([\w.+-]+) to ([\w.+-]+)/g;
  for (const m of body.matchAll(linkTableRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(plainTableRe))
    updates.push({ name: m[1].trim(), from: m[2], to: m[3] });
  for (const m of body.matchAll(singleRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(pipRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(backtickRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  const clean = updates
    .map((u) => ({ name: u.name, from: versionOf(u.from), to: versionOf(u.to) }))
    .filter((u) => /^\d/.test(u.from) && /^\d/.test(u.to));
  return [...new Map(clean.map((u) => [u.name + '@' + u.to, u])).values()];
}

export function semverDelta(from, to) {
  const parse = (v) => {
    const m = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(v);
    return m ? [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)] : null;
  };
  const a = parse(from);
  const b = parse(to);
  if (!a || !b) return null;
  if (b[0] > a[0]) return 'major';
  if (b[1] > a[1]) return 'minor';
  return 'patch';
}

export async function npmReleaseDate(name, version) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (!res.ok) return null;
  const doc = await res.json();
  const published = doc?.time?.[version];
  return published ? new Date(published) : null;
}

export async function pypiReleaseDate(name, version) {
  const res = await fetch(`https://pypi.org/pypi/${name}/${version}/json`);
  if (!res.ok) return null;
  const doc = await res.json();
  const stamp =
    doc?.urls?.[0]?.upload_time_iso_8601 ?? doc?.releases?.[version]?.[0]?.upload_time_iso_8601;
  return stamp ? new Date(stamp) : null;
}

export async function githubReleaseDate(name, version) {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
  const tags = [];
  if (!/^[0-9a-f]{40}$/.test(version)) tags.push(version, `v${version}`);
  for (const tag of tags) {
    const release = await fetch(`https://api.github.com/repos/${name}/releases/tags/${tag}`, {
      headers,
    });
    if (release.ok) {
      const doc = await release.json();
      if (doc?.published_at) return new Date(doc.published_at);
    }
  }
  for (const tag of tags) {
    const ref = await fetch(`https://api.github.com/repos/${name}/git/ref/tags/${tag}`, {
      headers,
    });
    if (!ref.ok) continue;
    const refDoc = await ref.json();
    const sha = refDoc?.object?.sha;
    if (!sha) continue;
    const commit = await fetch(`https://api.github.com/repos/${name}/commits/${sha}`, { headers });
    if (commit.ok) {
      const commitDoc = await commit.json();
      if (commitDoc?.commit?.committer?.date) return new Date(commitDoc.commit.committer.date);
    }
  }
  return null;
}

// Every package.json in the checkout, so workspaces and nested apps are covered
// without hardcoding this one repo's layout.
export function packageJsonPaths() {
  const found = [];
  const roots = ['.', 'apps', 'packages', 'web', 'client', 'server', 'src'];
  for (const root of roots) {
    const dir = join(process.cwd(), root);
    const rootManifest = join(root, 'package.json').replace(/^\.\//, '');
    if (!existsSync(join(dir, 'package.json'))) continue;
    found.push(rootManifest);
    if (root === '.' || root === 'apps' || root === 'packages') {
      try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (!entry.isDirectory() || entry.name === 'node_modules') continue;
          const nested = join(root, entry.name, 'package.json').replace(/^\.\//, '');
          if (existsSync(join(process.cwd(), nested))) found.push(nested);
        }
      } catch {
        // unreadable directory: treat as no nested manifest
      }
    }
  }
  return [...new Set(found)];
}

export function dependencyTypeOf(name, body) {
  const group = body.match(/the (production|development)-(?:patch|minor) group/);
  if (group) return group[1];
  const head = body.split('\n').slice(0, 3).join('\n');
  if (head.includes('github-actions group')) return 'actions';
  if (head.includes('Updates the requirements') || head.includes('Updates:')) {
    return readFileSafe('requirements-dev.txt', '').includes(name) ? 'development' : 'production';
  }
  for (const manifest of packageJsonPaths()) {
    const raw = readFileSafe(manifest, '');
    if (!raw) continue;
    try {
      const pkg = JSON.parse(raw);
      if (pkg.dependencies?.[name]) return 'production';
      if (pkg.devDependencies?.[name]) return 'development';
    } catch {
      // malformed manifest: fall through
    }
  }
  return 'production';
}

// A job that never started because the account is out of Actions minutes says
// nothing about the dependency bump, and no dependency change can fix it.
const BILLING_MARKER = 'recent account payments have failed';
const FAILED_CONCLUSIONS = [
  'FAILURE',
  'CANCELLED',
  'TIMED_OUT',
  'STARTUP_FAILURE',
  'ACTION_REQUIRED',
];

// A commit status (the GraphQL StatusContext, which is what the Vercel GitHub
// app posts) carries `state`, not `status` and `conclusion`. Reading `.status`
// off one yields undefined, and `undefined !== "COMPLETED"` used to read as
// "still running", so a single Vercel entry held auto-merge off on nearly
// every repo. Treat commit statuses on their own field names instead.
const PENDING_COMMIT_STATUS_STATES = ['PENDING', 'EXPECTED'];
const FAILED_COMMIT_STATUS_STATES = ['ERROR', 'FAILURE'];

// The Vercel GitHub app reports FAILURE with this marker on the free plan: the
// build never ran, so the status says nothing about the dependency bump. Same
// class as a job that never started because Actions was out of minutes.
const VERCEL_PLAN_LIMIT_MARKER = 'upgradeToPro=build-rate-limit';

function isCommitStatus(check) {
  return (
    check.__typename === 'StatusContext' ||
    (check.context !== undefined && check.conclusion === undefined)
  );
}

// Commit statuses have no `name`; their label lives in `context`.
function checkName(check) {
  return check.name ?? check.context ?? '(unnamed check)';
}

function vercelPlanLimitFailure(check) {
  if (!isCommitStatus(check) || !FAILED_COMMIT_STATUS_STATES.includes(check.state)) return false;
  return `${check.targetUrl ?? ''} ${check.description ?? ''}`.includes(VERCEL_PLAN_LIMIT_MARKER);
}

export function repoSlug(prUrl) {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  const m = /github\.com\/([^/]+\/[^/]+)\/pull\//.exec(prUrl ?? '');
  return m ? m[1] : null;
}

function jobIdOf(detailsUrl) {
  const m = /\/job\/(\d+)/.exec(detailsUrl ?? '');
  return m ? m[1] : null;
}

export function billingOnlyFailure(repo, check) {
  const jobId = jobIdOf(check.detailsUrl);
  if (!repo || !jobId) return false;
  try {
    const lines = gh(`api repos/${repo}/check-runs/${jobId}/annotations --jq '.[].message'`)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    // Any annotation carrying the marker is decisive. Requiring every
    // annotation to carry it made the exemption fail, because a runner image
    // notice is posted alongside the billing message.
    return lines.some((line) => line.includes(BILLING_MARKER));
  } catch {
    return false;
  }
}

// A check that is already red on the base branch is not evidence against this
// PR. Without this, one chronically broken job holds every bot PR open forever.
function failingOnBaseBranch(repo, branch) {
  const red = new Set();
  try {
    const runs =
      JSON.parse(gh(`api repos/${repo}/commits/${branch}/check-runs?filter=latest&per_page=100`))
        .check_runs ?? [];
    for (const run of runs) if (run.conclusion === 'failure') red.add(run.name);
  } catch {
    return red;
  }
  return red;
}

// GitHub only blocks an auto-merge when branch protection requires the check.
// Returns null when the rollup is good enough to merge on.
export function blockingCheck(prUrl) {
  let rollup = [];
  let baseBranch = null;
  try {
    const info = JSON.parse(gh(`pr view ${prUrl} --json statusCheckRollup,baseRefName`));
    rollup = info.statusCheckRollup ?? [];
    baseBranch = info.baseRefName ?? null;
  } catch {
    return 'could not read check status';
  }
  const repo = repoSlug(prUrl);
  const failed = rollup.filter((c) =>
    isCommitStatus(c)
      ? FAILED_COMMIT_STATUS_STATES.includes(c.state)
      : FAILED_CONCLUSIONS.includes(c.conclusion)
  );
  const billing = failed.filter((c) => billingOnlyFailure(repo, c));
  const planLimit = failed.filter((c) => vercelPlanLimitFailure(c));
  const baseRed =
    repo && baseBranch && failed.length > billing.length + planLimit.length
      ? failingOnBaseBranch(repo, baseBranch)
      : new Set();
  const real = failed.filter(
    (c) => !billing.includes(c) && !planLimit.includes(c) && !baseRed.has(checkName(c))
  );
  if (real.length > 0) {
    return `failing checks: ${real.map((c) => checkName(c)).join(', ')}`;
  }
  // Once the account is billing-blocked, queued jobs never start either, so a
  // job that never started carries no signal while that lasts.
  const billingBlocked = billing.length > 0;
  const pending = rollup.filter((c) => {
    const stillRunning = isCommitStatus(c)
      ? PENDING_COMMIT_STATUS_STATES.includes(c.state)
      : c.status !== 'COMPLETED';
    return stillRunning && (billingBlocked ? Boolean(c.startedAt) : true);
  });
  if (pending.length > 0) {
    return `checks still running: ${pending.map((c) => checkName(c)).join(', ')}`;
  }
  const ignored =
    billing.length +
    planLimit.length +
    failed.filter((c) => baseRed.has(checkName(c))).length;
  if (ignored > 0) {
    console.log(
      `dependabot-auto-merge: ignoring ${ignored} check(s) that never ran, were already red on ${baseBranch}, or were a Vercel free-plan refusal`
    );
  }
  return null;
}

async function releaseDateFor(name, version, ecosystem) {
  if (ecosystem === 'pip') return pypiReleaseDate(name, version);
  if (ecosystem === 'actions') return githubReleaseDate(name, version);
  return npmReleaseDate(name, version);
}

function ecosystemOf(body) {
  const head = body.split('\n').slice(0, 3).join('\n');
  if (head.includes('github-actions group')) return 'actions';
  if (head.includes('Updates the requirements') || head.includes('Updates:')) return 'pip';
  return 'npm';
}

async function main() {
  const info = prUrl
    ? JSON.parse(gh(`pr view ${prUrl} --json body,labels -q .`))
    : {
        body: process.env.PR_BODY ?? '',
        labels: (process.env.PR_LABELS ?? '').split(',').filter(Boolean),
      };
  const body = info.body;
  const labels = (info.labels ?? []).map((l) => (typeof l === 'string' ? l : l.name));
  const updates = parseUpdates(body);

  if (updates.length === 0) {
    console.log('dependabot-auto-merge: no parseable updates in PR body; kept for human');
    return;
  }

  const onHold = labels.includes('on-hold');
  const security = labels.includes('security');
  const ecosystem = ecosystemOf(body);

  let allow = !onHold;
  let youngest = null;
  for (const update of updates) {
    const delta = semverDelta(update.from, update.to);
    const depType = dependencyTypeOf(update.name, body);
    const release = await releaseDateFor(update.name, update.to, ecosystem);
    const ageDays = release ? (Date.now() - release.getTime()) / 86400000 : null;
    if (youngest === null || (ageDays !== null && ageDays < youngest)) youngest = ageDays;

    if (MANUAL_REVIEW_PACKAGES.has(update.name)) {
      allow = false;
      console.log(
        `dependabot-auto-merge: human review needed, ${update.name} is on the core-runtime list`
      );
      continue;
    }

    if (security) continue;
    const lowRisk =
      delta !== null &&
      delta !== 'major' &&
      (depType === 'development' || depType === 'actions' || delta === 'patch');
    if (!lowRisk) {
      allow = false;
      console.log(
        `dependabot-auto-merge: human review needed, ${update.name} ${update.from} -> ${update.to} (${depType}, ${delta ?? '?'})`
      );
    }
  }

  const mature = security || (youngest !== null && youngest >= MIN_AGE_DAYS);
  if (!mature) {
    allow = false;
    console.log(
      `dependabot-auto-merge: youngest release ${youngest === null ? 'unknown' : youngest.toFixed(1) + ' days'} old, need ${MIN_AGE_DAYS}; waiting`
    );
  }

  if (allow && requireGreenChecks()) {
    const blocker = blockingCheck(prUrl);
    if (blocker) {
      allow = false;
      console.log(`dependabot-auto-merge: waiting, ${blocker}`);
    }
  }

  if (allow) {
    if (dryRun) {
      console.log(
        `dependabot-auto-merge: dry-run would enable auto-merge (${updates.map((u) => u.name).join(', ')})`
      );
    } else {
      try {
        gh(`pr merge ${prUrl} --auto --squash`);
        console.log(`dependabot-auto-merge: auto-merge enabled for ${prUrl}`);
      } catch (err) {
        console.log(
          `dependabot-auto-merge: could not enable auto-merge (${err.message.split('\n')[0]}); keeping PR open`
        );
      }
    }
  } else {
    console.log('dependabot-auto-merge: kept for human review');
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main().catch((err) => {
    console.error('dependabot-auto-merge failed:', err.message);
    process.exit(1);
  });
}
