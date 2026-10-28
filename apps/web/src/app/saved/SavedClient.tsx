'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

import { parseSavedSlugs } from '@/lib/saved-entries';

const PAGE_SIZE = 20;

export interface SavedEntrySummary {
  slug: string;
  name: string;
}

export function SavedClient({ entries }: { entries: SavedEntrySummary[] }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const raw = localStorage.getItem('saved-entries');
    const parsed = parseSavedSlugs(raw);
    setSlugs(parsed);
    if (raw && parsed.length === 0) {
      localStorage.removeItem('saved-entries');
      setStorageError('Saved entries were unreadable and have been reset.');
    }
    setLoaded(true);
  }, []);

  const names = useMemo(() => new Map(entries.map((entry) => [entry.slug, entry.name])), [entries]);
  const totalPages = Math.ceil(slugs.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paged = slugs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clear = () => {
    localStorage.removeItem('saved-entries');
    setSlugs([]);
    setPage(1);
    setStorageError('');
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
        <Star className="h-7 w-7 text-brand" /> Saved entries
      </h1>
      <p className="mt-2 text-text-muted">Your bookmarked organisations. Saved in your browser.</p>

      {storageError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {storageError}
        </p>
      )}

      {!loaded ? (
        <p className="mt-6 text-text-muted">Loading saved entries…</p>
      ) : slugs.length === 0 ? (
        <p className="mt-6 text-text-muted">
          No saved entries yet. Browse the{' '}
          <Link href="/directory" className="text-brand hover:underline">
            directory
          </Link>{' '}
          to find organisations to bookmark.
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {slugs.length} saved {slugs.length === 1 ? 'entry' : 'entries'}.
            </p>
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-alt"
            >
              Clear all saved
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {paged.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/entry/${slug}`}
                  className="block rounded-lg border border-border p-3 font-semibold hover:text-brand"
                >
                  {names.get(slug) ?? slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
