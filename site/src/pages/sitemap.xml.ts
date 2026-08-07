import { entries, domains, regions, totalEntries } from "../lib/data";
import { slugify } from "../lib/data";
import { url } from "../lib/url";

// Build-time sitemap generation from all known routes
const BASE = "https://olitreadwell.github.io";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  priority?: number;
}

function toSitemap(): SitemapEntry[] {
  const items: SitemapEntry[] = [];

  // Static pages
  items.push({ loc: url("/"), priority: 1.0 });
  items.push({ loc: url("/directory/"), priority: 0.9 });
  items.push({ loc: url("/domains/"), priority: 0.8 });
  items.push({ loc: url("/regions/"), priority: 0.7 });
  items.push({ loc: url("/ecosystem/"), priority: 0.7 });
  items.push({ loc: url("/stats/"), priority: 0.6 });
  items.push({ loc: url("/get-involved/"), priority: 0.8 });

  // Domain pages
  for (const d of domains) {
    items.push({
      loc: url(`/domains/${d.slug}/`),
      priority: 0.7,
    });
  }

  // Region pages
  for (const r of regions) {
    items.push({
      loc: url(`/regions/${r.slug}/`),
      priority: 0.6,
    });
  }

  // Entry pages
  for (const e of entries) {
    items.push({
      loc: url(`/entry/${e.slug}/`),
      lastmod: e.last_verified,
      priority: 0.5,
    });
  }

  return items;
}

const items = toSitemap();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map((item) => `  <url>
    <loc>${item.loc}</loc>${item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : ""}
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

export function GET() {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
