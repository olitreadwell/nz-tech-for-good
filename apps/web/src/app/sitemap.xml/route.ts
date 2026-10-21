import { getAllEntries, getDomains, getRegions } from '@/lib/data';

// Resolved at build time so the route can be exported to a static file.
export const dynamic = 'force-static';

export async function GET() {
  const entries = getAllEntries();
  const domains = getDomains();
  const regions = getRegions();
  const base = 'https://olitreadwell.github.io/nz-tech-for-good';

  const urls = [
    `<url><loc>${base}/</loc><priority>1.0</priority></url>`,
    `<url><loc>${base}/directory</loc><priority>0.9</priority></url>`,
    `<url><loc>${base}/map</loc><priority>0.8</priority></url>`,
    `<url><loc>${base}/stats</loc><priority>0.7</priority></url>`,
    `<url><loc>${base}/get-involved</loc><priority>0.8</priority></url>`,
    `<url><loc>${base}/contact</loc><priority>0.7</priority></url>`,
    `<url><loc>${base}/domains</loc><priority>0.7</priority></url>`,
    ...domains.map(
      (d) => `<url><loc>${base}/domains/${d.slug}</loc><priority>0.6</priority></url>`
    ),
    ...entries.map(
      (e) =>
        `<url><loc>${base}/entry/${e.slug}</loc><lastmod>${e.last_verified}</lastmod><priority>0.5</priority></url>`
    ),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
}
