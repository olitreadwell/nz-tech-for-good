import { describe, expect, it } from 'vitest';

import { clampPage, readDirectoryState, writeDirectoryState } from '@/lib/directory-filters';

describe('directory URL state', () => {
  it('reads filters, sort, and page size from the query string', () => {
    expect(
      readDirectoryState('?q=data&domain=open-data&region=wellington&sort=name-desc&per_page=40')
    ).toEqual({
      q: 'data',
      domain: 'open-data',
      region: 'wellington',
      sort: 'name-desc',
      perPage: 40,
    });
  });

  it('falls back to safe defaults for invalid values', () => {
    expect(readDirectoryState('?sort=drop-table&per_page=999')).toMatchObject({
      sort: 'name-asc',
      perPage: 20,
    });
  });

  it('omits default values when serializing', () => {
    expect(
      writeDirectoryState({ q: '', domain: '', region: '', sort: 'name-asc', perPage: 20 })
    ).toBe('');
    expect(
      writeDirectoryState({ q: 'civic', domain: '', region: '', sort: 'name-asc', perPage: 40 })
    ).toBe('?q=civic&per_page=40');
  });

  it('clamps pages to a valid range', () => {
    expect(clampPage(0, 4)).toBe(1);
    expect(clampPage(9, 4)).toBe(4);
    expect(clampPage(2, 4)).toBe(2);
    expect(clampPage(2, 0)).toBe(1);
  });
});
