'use client';

import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight">This page could not load</h1>
      <p className="mt-3 text-text-muted">
        Something went wrong while rendering this page. Your saved entries are still in your
        browser.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand px-5 py-2 font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}
