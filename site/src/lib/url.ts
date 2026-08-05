/**
 * Build an internal URL that respects Astro's configured `base` path so links
 * work both locally and under the GitHub Pages project subpath.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function url(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Keep a trailing slash for directory-style routes (matches trailingSlash: always).
  if (clean === "/") return `${BASE}/`;
  return `${BASE}${clean}`;
}
