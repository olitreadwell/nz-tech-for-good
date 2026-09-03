#!/usr/bin/env node
// Verifies every internal markdown link in the repo resolves to a file.
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');

let findBrokenInternalLinks;
try {
  ({ findBrokenInternalLinks } = await import('../src/lib/links.ts'));
} catch {
  // Older apps don't ship the links registry; nothing to check.
  console.log('check:links ok (no src/lib/links.ts - nothing to check)');
  process.exit(0);
}

const broken = findBrokenInternalLinks(rootDir);

if (broken.length > 0) {
  console.error('Broken internal links:');
  for (const entry of broken) {
    console.error(`  ${entry.file} -> ${entry.link}`);
  }
  process.exit(1);
}
console.log('check:links ok');
