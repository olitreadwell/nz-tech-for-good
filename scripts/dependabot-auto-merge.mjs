#!/usr/bin/env node
// Dependabot auto-merge gate. Enables auto-merge only for low-risk updates
// whose releases are all at least
// MIN_AGE_DAYS old. Mirrors the old Renovate minimumReleaseAge policy:
//   - development deps: auto-merge any non-major version
//   - production deps: auto-merge patch only
//   - github-actions: auto-merge any non-major version
//   - security advisory PRs: auto-merge regardless of version or release age
//   - an on-hold label always blocks auto-merge
//
// Runs from the base branch's checkout via pull_request_target, so only
// trusted code (this repo's own script) executes.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIN_AGE_DAYS = Number(process.env.MIN_AGE_DAYS ?? 3);
const prUrl = process.argv[2];
const dryRun = !!process.env.PR_DRY_RUN;

function gh(args) {
  return execSync(`gh ${args}`, { encoding: "utf8", env: process.env }).trim();
}

function readFileSafe(relativePath, fallback) {
  try {
    return readFileSync(join(process.cwd(), relativePath), "utf8");
  } catch {
    return fallback;
  }
}

function versionOf(value) {
  return value.trim().replace(/[.\s]+$/g, "");
}

export function parseUpdates(body) {
  const updates = [];
  const linkTableRe = /^\| \[([^\]]+)\]\([^)]*\) \| ([\w.+-]+) \| ([\w.+-]+) \|$/gm;
  const plainTableRe = /^\| ([^|[\]]+) \| ([\w.+-]+) \| ([\w.+-]+) \|$/gm;
  const singleRe = /\[([^\]]+)\]\([^)]*\) from ([\w.+-]+) to ([\w.+-]+)/g;
  const pipRe = /Updates:?\s+([\w.-]+) from ([\w.+-]+) to ([\w.+-]+)/g;
  const backtickRe = /Updates?\s+`([^`]+)` from ([\w.+-]+) to ([\w.+-]+)/g;
  for (const m of body.matchAll(linkTableRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(plainTableRe)) updates.push({ name: m[1].trim(), from: m[2], to: m[3] });
  for (const m of body.matchAll(singleRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(pipRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  for (const m of body.matchAll(backtickRe)) updates.push({ name: m[1], from: m[2], to: m[3] });
  const clean = updates
    .map((u) => ({ name: u.name, from: versionOf(u.from), to: versionOf(u.to) }))
    .filter((u) => /^\d/.test(u.from) && /^\d/.test(u.to));
  return [...new Map(clean.map((u) => [u.name + "@" + u.to, u])).values()];
}

export function semverDelta(from, to) {
  const parse = (v) => {
    const m = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(v);
    return m ? [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)] : null;
  };
  const a = parse(from);
  const b = parse(to);
  if (!a || !b) return null;
  if (b[0] > a[0]) return "major";
  if (b[1] > a[1]) return "minor";
  return "patch";
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
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const tags = [];
  if (!/^[0-9a-f]{40}$/.test(version)) tags.push(version, `v${version}`);
  for (const tag of tags) {
    const release = await fetch(`https://api.github.com/repos/${name}/releases/tags/${tag}`, { headers });
    if (release.ok) {
      const doc = await release.json();
      if (doc?.published_at) return new Date(doc.published_at);
    }
  }
  for (const tag of tags) {
    const ref = await fetch(`https://api.github.com/repos/${name}/git/ref/tags/${tag}`, { headers });
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

export function dependencyTypeOf(name, body) {
  const group = body.match(/the (production|development)-(?:patch|minor) group/);
  if (group) return group[1];
  const head = body.split("\n").slice(0, 3).join("\n");
  if (head.includes("github-actions group")) return "actions";
  if (head.includes("Updates the requirements") || head.includes("Updates:")) {
    return readFileSafe("requirements-dev.txt", "").includes(name) ? "development" : "production";
  }
  for (const manifest of ["package.json", "apps/web/package.json", "packages/ui/package.json"]) {
    const raw = readFileSafe(manifest, "");
    if (!raw) continue;
    try {
      const pkg = JSON.parse(raw);
      if (pkg.dependencies?.[name]) return "production";
      if (pkg.devDependencies?.[name]) return "development";
    } catch {
      // malformed manifest: fall through
    }
  }
  return "production";
}

async function releaseDateFor(name, version, ecosystem) {
  if (ecosystem === "pip") return pypiReleaseDate(name, version);
  if (ecosystem === "actions") return githubReleaseDate(name, version);
  return npmReleaseDate(name, version);
}

function ecosystemOf(body) {
  const head = body.split("\n").slice(0, 3).join("\n");
  if (head.includes("github-actions group")) return "actions";
  if (head.includes("Updates the requirements") || head.includes("Updates:")) return "pip";
  return "npm";
}

async function main() {
  const info = prUrl
    ? JSON.parse(gh(`pr view ${prUrl} --json body,labels -q .`))
    : { body: process.env.PR_BODY ?? "", labels: (process.env.PR_LABELS ?? "").split(",").filter(Boolean) };
  const body = info.body;
  const labels = (info.labels ?? []).map((l) => (typeof l === "string" ? l : l.name));
  const updates = parseUpdates(body);

  if (updates.length === 0) {
    console.log("dependabot-auto-merge: no parseable updates in PR body; kept for human");
    return;
  }

  const onHold = labels.includes("on-hold");
  const security = labels.includes("security");
  const ecosystem = ecosystemOf(body);

  let allow = !onHold;
  let youngest = null;
  for (const update of updates) {
    const delta = semverDelta(update.from, update.to);
    const depType = dependencyTypeOf(update.name, body);
    const release = await releaseDateFor(update.name, update.to, ecosystem);
    const ageDays = release ? (Date.now() - release.getTime()) / 86400000 : null;
    if (youngest === null || (ageDays !== null && ageDays < youngest)) youngest = ageDays;

    if (security) continue;
    const lowRisk =
      delta !== null && delta !== "major" &&
      (depType === "development" || depType === "actions" || delta === "patch");
    if (!lowRisk) {
      allow = false;
      console.log(`dependabot-auto-merge: human review needed, ${update.name} ${update.from} -> ${update.to} (${depType}, ${delta ?? "?"})`);
    }
  }

  const mature = security || (youngest !== null && youngest >= MIN_AGE_DAYS);
  if (!mature) {
    allow = false;
    console.log(`dependabot-auto-merge: youngest release ${youngest === null ? "unknown" : youngest.toFixed(1) + " days"} old, need ${MIN_AGE_DAYS}; waiting`);
  }

  if (allow) {
    if (dryRun) {
      console.log(`dependabot-auto-merge: dry-run would enable auto-merge (${updates.map((u) => u.name).join(", ")})`);
    } else {
      gh(`pr merge ${prUrl} --auto --squash`);
      console.log(`dependabot-auto-merge: auto-merge enabled for ${prUrl}`);
    }
  } else {
    console.log("dependabot-auto-merge: kept for human review");
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  main().catch((err) => {
    console.error("dependabot-auto-merge failed:", err.message);
    process.exit(1);
  });
}
