import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBasePath, getSiteOrigin, getSiteUrl, withBasePath } from '@/lib/site';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('standalone deployment URLs', () => {
  it('defaults to the Vercel origin and no base path', () => {
    expect(getSiteOrigin()).toBe('https://nz-tech-for-good.vercel.app');
    expect(getBasePath()).toBe('');
    expect(withBasePath('/directory')).toBe('/directory');
    expect(getSiteUrl('/entry/test-org')).toBe(
      'https://nz-tech-for-good.vercel.app/entry/test-org'
    );
  });

  it('keeps an explicit site URL override working', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.org/');
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/');

    expect(getSiteOrigin()).toBe('https://example.org');
    expect(getBasePath()).toBe('');
    expect(getSiteUrl('/directory')).toBe('https://example.org/directory');
  });
});
