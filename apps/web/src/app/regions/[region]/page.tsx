import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getAllEntries, getRegions } from '@/lib/data';
import { EntryCard } from '@/components/EntryCard';

export function generateStaticParams() {
  return getRegions().map((r) => ({ region: r.slug }));
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const entries = getAllEntries();
  const regions = getRegions();
  const r = regions.find((x) => x.slug === region);
  if (!r) notFound();

  const items = entries.filter((e) => {
    const slug = e.region.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return slug === region;
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="mb-4 inline-block text-sm text-text-muted hover:text-brand">
        ← Home
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">{r.name}</h1>
      <p className="mt-2 text-text-muted">
        {items.length} {items.length === 1 ? 'organisation' : 'organisations'} in this region.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entry) => (
          <EntryCard key={entry.slug} {...entry} />
        ))}
      </ul>
    </main>
  );
}
