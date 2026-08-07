import { entries } from "../lib/data";
import { url } from "../lib/url";

const BASE = "https://olitreadwell.github.io";

// Sort by last_verified, newest first
const newest = [...entries]
  .filter((e) => e.last_verified)
  .sort((a, b) => (b.last_verified || "").localeCompare(a.last_verified || ""))
  .slice(0, 20);

const items = newest
  .map((e) => `    <item>
      <title>${escapeXml(e.name)}</title>
      <link>${url(`/entry/${e.slug}/`)}</link>
      <description>${escapeXml(e.what)}</description>
      <pubDate>${new Date(e.last_verified).toUTCString()}</pubDate>
      <category>${escapeXml(e.domainLabel)}</category>
    </item>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NZ Tech-for-Good</title>
    <link>${BASE}/nz-tech-for-good/</link>
    <description>Recently added and updated organisations in the NZ Tech-for-Good directory.</description>
    <language>en-NZ</language>
    <atom:link href="${BASE}/nz-tech-for-good/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
