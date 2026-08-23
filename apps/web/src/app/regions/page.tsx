import Link from "next/link";

import { getRegions } from "@/lib/data";

export default function RegionsPage() {
  const regions = getRegions();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Regions</h1>
      <p className="mt-2 text-text-muted">Browse organisations by NZ region.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {regions.map((r) => (
          <Link
            key={r.name}
            href={`/regions/${r.slug}`}
            className="rounded-lg border border-border p-4 hover:bg-surface-alt"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{r.name}</span>
              <span className="text-sm text-text-muted">{r.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
