import Link from "next/link";
import { ArrowRight, BarChart3, FolderOpen, MapPin } from "lucide-react";

import { getAllEntries, getDomains, getRegions } from "@/lib/data";
import { EntryCard } from "@/components/EntryCard";

export default function HomePage() {
  const entries = getAllEntries();
  const domains = getDomains();
  const regions = getRegions();
  const newest = [...entries]
    .sort((a, b) => b.last_verified.localeCompare(a.last_verified))
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Aotearoa tech for public good
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-muted">
          A living directory of {entries.length} organisations, projects, and
          networks using technology for public benefit — open data, civic tech,
          climate, accessibility, Māori data sovereignty, and more.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Browse {entries.length} organisations
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/get-involved"
            className="rounded-lg border border-border px-6 py-3 font-semibold hover:bg-surface-alt"
          >
            Get involved
          </Link>
        </div>
        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <FolderOpen className="mx-auto h-6 w-6 text-brand" />
            <div className="mt-1 text-3xl font-extrabold text-brand">
              {entries.length}
            </div>
            <div className="text-sm text-text-muted">organisations</div>
          </div>
          <div className="text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-brand" />
            <div className="mt-1 text-3xl font-extrabold text-brand">
              {domains.length}
            </div>
            <div className="text-sm text-text-muted">domains</div>
          </div>
          <div className="text-center">
            <MapPin className="mx-auto h-6 w-6 text-brand" />
            <div className="mt-1 text-3xl font-extrabold text-brand">
              {regions.length}
            </div>
            <div className="text-sm text-text-muted">regions</div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Recently added or updated</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((entry) => (
            <EntryCard key={entry.slug} {...entry} />
          ))}
        </ul>
        <p className="mt-4">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1 text-brand hover:underline"
          >
            Browse all {entries.length} organisations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </section>
    </main>
  );
}
