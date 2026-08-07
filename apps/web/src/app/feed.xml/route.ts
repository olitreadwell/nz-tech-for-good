import { getAllEntries } from "@/lib/data";

export async function GET() {
  const entries = getAllEntries();
  const newest = [...entries]
    .filter((e) => e.last_verified)
    .sort((a, b) => b.last_verified.localeCompare(a.last_verified))
    .slice(0, 20);
  const base = "https://nz-tech-for-good.vercel.app";

  const items = newest
    .map(
      (e) =>
        `<item><title>${e.name}</title><link>${base}/entry/${e.slug}</link><description>${e.what}</description><pubDate>${new Date(e.last_verified).toUTCString()}</pubDate><category>${e.domainLabel}</category></item>`,
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NZ Tech-for-Good</title><link>${base}</link><description>Recently updated organisations</description>${items}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml" } },
  );
}
