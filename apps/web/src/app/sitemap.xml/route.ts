import { getAllEntries, getDomains, getRegions } from '@/lib/data';
import { getSiteUrl } from '@/lib/site';
import { escapeXml } from '@/lib/xml';

// Resolved at build time so the route can be exported to a static file.
export const dynamic = 'force-static';

export async function GET() {
  const entries = getAllEntries();
  const domains = getDomains();
  const regions = getRegions();

  const urls = [
    `<url><loc>${escapeXml(getSiteUrl('/'))}</loc><priority>1.0</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/directory'))}</loc><priority>0.9</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/map'))}</loc><priority>0.8</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/stats'))}</loc><priority>0.7</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/get-involved'))}</loc><priority>0.8</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/contact'))}</loc><priority>0.7</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/domains'))}</loc><priority>0.7</priority></url>`,
    `<url><loc>${escapeXml(getSiteUrl('/regions'))}</loc><priority>0.7</priority></url>`,
    ...domains.map(
      (d) =>
        `<url><loc>${escapeXml(getSiteUrl(`/domains/${d.slug}`))}</loc><priority>0.6</priority></url>`
    ),
    ...regions.map(
      (r) =>
        `<url><loc>${escapeXml(getSiteUrl(`/regions/${r.slug}`))}</loc><priority>0.6</priority></url>`
    ),
    ...entries.map(
      (e) =>
        `<url><loc>${escapeXml(getSiteUrl(`/entry/${e.slug}`))}</loc><lastmod>${escapeXml(e.last_verified)}</lastmod><priority>0.5</priority></url>`
    ),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
