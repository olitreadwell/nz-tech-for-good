import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-text-muted">
        That page could not be found.
      </p>
      <div className="mt-8 space-y-3">
        <div>
          <Link
            href="/"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go home
          </Link>
        </div>
        <div className="flex justify-center gap-3 text-sm">
          <Link href="/directory" className="text-brand hover:underline">
            Browse directory
          </Link>
          <Link href="/get-involved" className="text-brand hover:underline">
            Get involved
          </Link>
          <Link href="/stats" className="text-brand hover:underline">
            Stats
          </Link>
        </div>
      </div>
    </main>
  );
}
