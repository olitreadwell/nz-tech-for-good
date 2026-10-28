'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

import { parseSavedSlugs } from '@/lib/saved-entries';

const STORAGE_KEY = 'saved-entries';

export function SaveEntryButton({ slug, name }: { slug: string; name: string }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSaved(parseSavedSlugs(localStorage.getItem(STORAGE_KEY)).includes(slug));
  }, [slug]);

  const toggleSaved = () => {
    const current = parseSavedSlugs(localStorage.getItem(STORAGE_KEY));
    const next = current.includes(slug)
      ? current.filter((savedSlug) => savedSlug !== slug)
      : [...current, slug];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next.includes(slug));
      setError('');
    } catch {
      setError('Could not save this entry because browser storage is full.');
    }
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
      >
        <Star className={`h-4 w-4 ${saved ? 'fill-brand text-brand' : ''}`} />
        {saved ? 'Saved' : 'Save'}
        <span className="sr-only"> {name}</span>
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-300">
          {error}
        </span>
      )}
    </span>
  );
}
