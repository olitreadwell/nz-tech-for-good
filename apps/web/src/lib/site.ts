const DEFAULT_SITE_ORIGIN = 'https://olitreadwell.github.io';
const DEFAULT_BASE_PATH = '/nz-tech-for-good';

/** Public site origin, without a trailing slash. */
export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_ORIGIN).replace(/\/$/, '');
}

/** Base path the static export is mounted under, without a trailing slash. */
export function getBasePath(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? DEFAULT_BASE_PATH).replace(/\/$/, '');
}

/** Absolute public URL for a path inside the site. */
export function getSiteUrl(pathname = ''): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getSiteOrigin()}${getBasePath()}${path === '/' ? '' : path}`;
}

/** Prefix an internal path with the static-export base path. */
export function withBasePath(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getBasePath()}${path === '/' ? '' : path}`;
}
