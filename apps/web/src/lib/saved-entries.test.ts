import { describe, expect, it } from 'vitest';

import { parseSavedSlugs } from '@/lib/saved-entries';

describe('parseSavedSlugs', () => {
  it('returns an empty list for missing data', () => {
    expect(parseSavedSlugs(null)).toEqual([]);
  });

  it('returns valid string slugs', () => {
    expect(parseSavedSlugs('["alpha", "beta"]')).toEqual(['alpha', 'beta']);
  });

  it('recovers from corrupt JSON instead of throwing', () => {
    expect(parseSavedSlugs('not-json')).toEqual([]);
  });

  it('drops non-string values', () => {
    expect(parseSavedSlugs('["alpha", 3, null, "beta"]')).toEqual(['alpha', 'beta']);
  });
});
