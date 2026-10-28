import { describe, expect, it } from 'vitest';

import { escapeXml } from '@/lib/xml';

describe('escapeXml', () => {
  it('escapes XML metacharacters', () => {
    expect(escapeXml(`Tom & Jerry's <tag> "quoted"`)).toBe(
      'Tom &amp; Jerry&apos;s &lt;tag&gt; &quot;quoted&quot;'
    );
  });

  it('leaves macrons and other Unicode text intact', () => {
    expect(escapeXml('Whānau Tahi · Māori')).toBe('Whānau Tahi · Māori');
  });
});
