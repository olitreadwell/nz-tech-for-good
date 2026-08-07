import Link from "next/link";

import { getDomains } from "@/lib/data";

export default function DomainsPage() {
  const domains = getDomains();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Domains</h1>
      <p className="mt-2 text-text-muted">
        {domains.length} areas of public good these organisations work in.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {domains.map((d) => (
          <Link
            key={d.key}
            href={`/directory?domain=${d.key}`}
            className="rounded-lg border border-border p-4 hover:bg-surface-alt"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{d.label}</span>
              <span className="text-sm text-text-muted">{d.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
