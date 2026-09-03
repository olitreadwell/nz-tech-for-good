import { describe, it, expect } from 'vitest';

import { buildEntryFeedbackUrl } from '@/lib/feedback';

describe('buildEntryFeedbackUrl', () => {
  it('builds a GitHub issue URL with encoded title and body', () => {
    const url = buildEntryFeedbackUrl({
      slug: 'test-org',
      name: 'Test Organisation',
    });

    expect(url).toMatch(/^https:\/\/github\.com\/olitreadwell\/nz-tech-for-good\/issues\/new\?/);
    expect(url).toContain(`title=${encodeURIComponent('Entry update: Test Organisation')}`);
    expect(url).toContain(encodeURIComponent('https://nz-tech-for-good.vercel.app/entry/test-org'));
    expect(url).toContain(encodeURIComponent('data/entries/test-org.yaml'));
    expect(url).toContain(encodeURIComponent('Spotted a mistake'));
  });

  it('falls back to the slug when name is missing or blank', () => {
    const url = buildEntryFeedbackUrl({ slug: 'test-org', name: '   ' });

    expect(url).toContain(`title=${encodeURIComponent('Entry update: test-org')}`);
    expect(url).toContain(encodeURIComponent('**Entry:** test-org'));
  });
});
