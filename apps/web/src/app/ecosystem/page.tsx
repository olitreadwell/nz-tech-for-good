import Link from "next/link";

import { getAllEntries, getDomains } from "@/lib/data";
import { EntryCard } from "@/components/EntryCard";

export default function EcosystemPage() {
  const entries = getAllEntries();
  const domains = getDomains();

  const domainEdges: { a: string; b: string; count: number }[] = [];
  const entryMap = new Map(entries.map((e) => [e.name, e]));
  const domainMap = new Map(domains.map((d) => [d.key, d]));

  for (const e of entries) {
    for (const ref of e.related_to) {
      const target = entries.find((x) => x.name === ref);
      if (!target || target.domain === e.domain) continue;
      const da = e.domain;
      const db = target.domain;
      const key = [da, db].sort().join("||");
      const existing = domainEdges.find(
        (x) => [x.a, x.b].sort().join("||") === key,
      );
      if (existing) existing.count++;
      else domainEdges.push({ a: da, b: db, count: 1 });
    }
  }
  domainEdges.sort((a, b) => b.count - a.count);

  // Entries with related links
  const crossLinked = entries.filter((e) =>
    e.related_to.some((ref) => {
      const t = entryMap.get(ref);
      return t && t.domain !== e.domain;
    }),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Ecosystem</h1>
      <p className="mt-2 text-text-muted">
        How domains connect through real, verified relationships between
        organisations. {domainEdges.length} cross-domain connections across{" "}
        {crossLinked.length} organisations.
      </p>

      {domainEdges.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Cross-domain connections</h2>
          <div className="mt-3 space-y-2">
            {domainEdges.map((e) => (
              <Link
                key={`${e.a}-${e.b}`}
                href={`/domains`}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-alt"
              >
                <span>
                  <span className="font-medium">
                    {domainMap.get(e.a)?.label ?? e.a}
                  </span>
                  <span className="mx-2 text-text-muted">↔</span>
                  <span className="font-medium">
                    {domainMap.get(e.b)?.label ?? e.b}
                  </span>
                </span>
                <span className="text-sm text-text-muted">{e.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold">
          Cross-linked organisations ({crossLinked.length})
        </h2>
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crossLinked.slice(0, 30).map((e) => (
            <EntryCard key={e.slug} {...e} />
          ))}
        </ul>
      </div>
    </main>
  );
}
