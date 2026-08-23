import Link from "next/link";

import { getAllEntries } from "@/lib/data";

export default function TagsPage() {
  const entries = getAllEntries();
  const tagCounts = new Map<string, number>();
  for (const e of entries)
    for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Tags</h1>
      <p className="mt-2 text-text-muted">
        Browse by tag. Bigger tags have more entries.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t.name}
            href={`/directory?q=${encodeURIComponent(t.name)}`}
            className="rounded-full bg-surface-alt px-3 py-1 text-sm hover:bg-brand-soft hover:text-brand"
            style={{ fontSize: `${0.75 + (t.count / tags[0].count) * 1}rem` }}
          >
            {t.name} <span className="text-text-muted">({t.count})</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
