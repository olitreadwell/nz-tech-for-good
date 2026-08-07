import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllEntries, getDomains } from "@/lib/data";
import { EntryCard } from "@/components/EntryCard";

export function generateStaticParams() {
  return getDomains().map((d) => ({ domain: d.slug }));
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const entries = getAllEntries();
  const domains = getDomains();
  const d = domains.find((x) => x.slug === domain);
  if (!d) notFound();

  const items = entries.filter((e) => e.domain === d.key);

  // Connected domains
  const relatedDomains = domains
    .filter((x) => x.key !== d.key && entries.some((e) => e.domain === x.key))
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/domains"
        className="mb-4 inline-block text-sm text-text-muted hover:text-brand"
      >
        ← All domains
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">{d.label}</h1>
      <p className="mt-2 text-lg text-text-muted">
        {items.length} {items.length === 1 ? "organisation" : "organisations"}{" "}
        in this domain.
      </p>

      {relatedDomains.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-text-muted">Connected domains:</span>
          {relatedDomains.map((r) => (
            <Link
              key={r.slug}
              href={`/domains/${r.slug}`}
              className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand hover:bg-brand hover:text-white"
            >
              {r.label}
            </Link>
          ))}
        </div>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entry) => (
          <EntryCard key={entry.slug} {...entry} />
        ))}
      </ul>
    </main>
  );
}
