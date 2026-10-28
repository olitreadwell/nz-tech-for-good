import { describe, expect, it } from 'vitest';

import { toSlug } from '@/lib/slug';

describe('toSlug', () => {
  it('lowercases and hyphenates names', () => {
    expect(toSlug('Housing & Homelessness Tech')).toBe('housing-homelessness-tech');
    expect(toSlug('Māori Data Sovereignty')).toBe('m-ori-data-sovereignty');
  });

  it('trims leading and trailing separators', () => {
    expect(toSlug('  Bay of Plenty!  ')).toBe('bay-of-plenty');
  });
});
