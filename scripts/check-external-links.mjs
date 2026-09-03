#!/usr/bin/env node
// Enforces the template rule: every link to an external domain opens in a
// new tab with rel="noopener noreferrer". Scans JSX/TSX source for <a> and
// <Link> tags with external hrefs and fails when target/rel are missing.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (/\.(tsx|jsx)$/.test(entry)) {
      checkFile(path);
    }
  }
}

function checkFile(file) {
  const source = readFileSync(file, 'utf8');
  const tagPattern = /<(a|Link)\b[^>]*>/g;
  let match;
  while ((match = tagPattern.exec(source)) !== null) {
    const tag = match[0];
    const href = /href=["'](https?:\/\/|\/\/)[^"']+["']/.exec(tag);
    if (!href) continue;
    const hasTargetBlank = /target=["']_blank["']/.test(tag);
    const hasNoopener = /rel=["'][^"']*noopener[^"']*["']/.test(tag);
    if (!hasTargetBlank || !hasNoopener) {
      violations.push(
        `${file}: external link ${href[0]} needs target="_blank" and rel="noopener noreferrer"`
      );
    }
  }
}

walk(join(rootDir, 'src'));

if (violations.length > 0) {
  console.error('External links must open in a new tab:');
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}
console.log('check:external-links ok');
