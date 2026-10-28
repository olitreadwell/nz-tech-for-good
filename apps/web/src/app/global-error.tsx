'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-NZ">
      <body>
        <main style={{ margin: '4rem auto', maxWidth: '40rem', padding: '0 1rem' }}>
          <h1>NZ Tech-for-Good could not load</h1>
          <p>An unexpected error stopped the application from rendering.</p>
          {error.digest && <p>Error reference: {error.digest}</p>}
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
