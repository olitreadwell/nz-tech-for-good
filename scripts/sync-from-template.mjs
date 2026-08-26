#!/usr/bin/env node
// Pulls template-owned files into this repo so quality gates and docs stay
// in sync without touching app code. Policies live in template-manifest.json
// (in the TEMPLATE repo, so they can evolve with the template).
//
// Usage:
//   node scripts/sync-from-template.mjs                # dry-run report
//   node scripts/sync-from-template.mjs --apply        # write + commit
//   node scripts/sync-from-template.mjs --apply --push # commit + push + PR
//   node scripts/sync-from-template.mjs --repo ../x    # target another repo
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, writeFile, copyFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const push = args.includes('--push');
const repoArg = args.indexOf('--repo');
const repoDir = resolve(repoArg === -1 ? process.cwd() : args[repoArg + 1]);
const templateUrl = process.env.TEMPLATE_URL ?? 'https://github.com/olitreadwell/template.git';

function run(cmd, cwd = repoDir) {
  return execFileSync(cmd[0], cmd.slice(1), {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function isGitRepo() {
  try {
    run(['git', 'rev-parse', '--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

function defaultBranch() {
  try {
    return run(['git', 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(
      'origin/',
      ''
    );
  } catch {
    return 'main';
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// A manifest entry is either a path string or { path, if }. The `if` value
// is a top-level glob (e.g. "package.json", "next.config.*") that must match
// something in the target repo for the file to be copied.
function entryPath(entry) {
  return typeof entry === 'string' ? entry : entry.path;
}

function entryCondition(entry) {
  return typeof entry === 'string' ? null : (entry.if ?? null);
}

function globToRegExp(glob) {
  return new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
}

async function conditionMet(condition, targetDir) {
  if (!condition) return true;
  const entries = await readdir(targetDir);
  const re = globToRegExp(condition);
  return entries.some((name) => re.test(name));
}

async function main() {
  if (!isGitRepo()) {
    console.error(`not a git repo: ${repoDir}`);
    process.exit(1);
  }

  const cacheDir = await mkdtemp(join(tmpdir(), 'template-sync-'));
  try {
    console.log(`cloning template: ${templateUrl}`);
    execFileSync('git', ['clone', '--depth', '1', '--quiet', templateUrl, join(cacheDir, 'tmpl')], {
      stdio: 'inherit',
    });
    const tmpl = join(cacheDir, 'tmpl');
    const manifest = readJson(join(tmpl, 'template-manifest.json'));

    const changes = [];
    for (const policy of ['copy', 'copyIfAbsent']) {
      for (const rel of manifest.policies[policy]) {
        const path = entryPath(rel);
        const condition = entryCondition(rel);
        if (!(await conditionMet(condition, repoDir))) {
          continue; // target repo does not match the condition
        }
        const src = join(tmpl, path);
        const dst = join(repoDir, path);
        let srcContent;
        try {
          srcContent = await readFile(src);
        } catch {
          console.warn(`  SKIP (missing in template): ${path}`);
          continue;
        }
        let dstExists = true;
        let dstContent;
        try {
          dstContent = await readFile(dst);
        } catch {
          dstExists = false;
        }
        if (policy === 'copyIfAbsent' && dstExists) {
          continue; // local file wins
        }
        if (dstExists && srcContent.equals(dstContent)) {
          continue; // already in sync
        }
        changes.push({ rel: path, action: dstExists ? 'UPDATE' : 'ADD' });
        if (apply) {
          await mkdirp(dirname(dst));
          await copyFile(src, dst);
        }
      }
    }

    // package.json merge: union scripts + devDependencies (local wins).
    if (manifest.policies.merge.includes('package.json')) {
      const tmplPkg = readJson(join(tmpl, 'package.json'));
      let localPkg;
      try {
        localPkg = readJson(join(repoDir, 'package.json'));
      } catch {
        localPkg = {};
      }
      const merged = structuredClone(localPkg);
      merged.scripts = { ...tmplPkg.scripts, ...(localPkg.scripts ?? {}) };
      merged.devDependencies = { ...tmplPkg.devDependencies, ...(localPkg.devDependencies ?? {}) };
      merged.dependencies = { ...tmplPkg.dependencies, ...(localPkg.dependencies ?? {}) };
      merged.packageManager = localPkg.packageManager ?? tmplPkg.packageManager;
      if (JSON.stringify(merged) !== JSON.stringify(localPkg)) {
        changes.push({ rel: 'package.json', action: 'MERGE' });
        if (apply)
          await writeFile(join(repoDir, 'package.json'), `${JSON.stringify(merged, null, 2)}\n`);
      }
    }

    const base = defaultBranch();
    console.log(`\ntarget: ${repoDir} (base: ${base})`);
    if (changes.length === 0) {
      console.log('in sync — nothing to do');
      return;
    }
    for (const c of changes) console.log(`  ${c.action.padEnd(6)} ${c.rel}`);

    if (!apply) {
      console.log('\ndry-run: no files written. Re-run with --apply (and --push for a PR).');
      return;
    }

    run(['git', 'checkout', '-q', base]);
    const branch = 'chore/template-sync';
    try {
      run(['git', 'branch', '-D', branch]);
    } catch {}
    run(['git', 'checkout', '-q', '-b', branch]);
    run(['git', 'add', '-A']);
    run(['git', 'commit', '-q', '-m', 'chore: sync files from template', '--allow-empty']);
    console.log(`\ncommitted on ${branch}`);

    if (push) {
      run(['git', 'push', '-u', 'origin', branch]);
      const gh = 'gh';
      try {
        const prUrl = run([
          gh,
          'pr',
          'create',
          '--base',
          base,
          '--head',
          branch,
          '--title',
          'chore: sync template files',
          '--body',
          'Automated sync from the starter template (`scripts/sync-from-template.mjs`). Review and merge.',
        ]);
        console.log(`PR: ${prUrl}`);
      } catch (err) {
        console.warn(`push ok, but PR create failed: ${String(err.message ?? err).slice(0, 300)}`);
      }
    }
  } finally {
    await rm(cacheDir, { recursive: true, force: true });
  }
}

async function mkdirp(dir) {
  await mkdir(dir, { recursive: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
