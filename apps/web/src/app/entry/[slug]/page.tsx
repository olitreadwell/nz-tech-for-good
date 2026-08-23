import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  GitBranch,
  Briefcase,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

import { getAllEntries } from "@/lib/data";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entries = getAllEntries();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const related = entries.filter(
    (e) =>
      entry.related_to.includes(e.name) || e.related_to.includes(entry.name),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/directory"
        className="mb-4 inline-block text-sm text-text-muted hover:text-brand"
      >
        ← Directory
      </Link>

      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-text-muted">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span className="mx-1">/</span>
        <Link href="/directory" className="hover:text-brand">
          Directory
        </Link>
        <span className="mx-1">/</span>
        <span>{entry.name}</span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: entry.name,
            description: entry.what,
            url: entry.website || undefined,
            sameAs: [
              entry.github,
              entry.linkedin_org,
              entry.community_url,
              entry.events_url,
            ].filter(Boolean),
            foundingDate: entry.founding_year
              ? String(entry.founding_year)
              : undefined,
            location:
              entry.region !== "national"
                ? { "@type": "Place", name: entry.region }
                : { "@type": "Country", name: "New Zealand" },
          }),
        }}
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-medium text-brand">
          {entry.domainLabel}
        </span>
        {entry.takes_contributors && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            Takes contributors
          </span>
        )}
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">{entry.name}</h1>
      <p className="mt-3 text-lg text-text-muted">{entry.what}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {entry.website && (
          <a
            href={entry.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            <Globe className="h-4 w-4" /> Website
          </a>
        )}
        {entry.github && (
          <a
            href={entry.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            <GitBranch className="h-4 w-4" /> GitHub
          </a>
        )}
        {entry.linkedin_org && (
          <a
            href={entry.linkedin_org}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            <Briefcase className="h-4 w-4" /> LinkedIn
          </a>
        )}
        {entry.community_url && (
          <a
            href={entry.community_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            <MessageCircle className="h-4 w-4" /> Community
          </a>
        )}
        {entry.events_url && (
          <a
            href={entry.events_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            <Calendar className="h-4 w-4" /> Events
          </a>
        )}
        {entry.careers_url && (
          <a
            href={entry.careers_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-alt"
          >
            Careers
          </a>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="font-semibold text-text-muted">Domain</dt>
        <dd>
          <Link
            href={`/domains/${entry.domain.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="text-brand hover:underline"
          >
            {entry.domainLabel}
          </Link>
        </dd>
        <dt className="font-semibold text-text-muted">Region</dt>
        <dd className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {entry.region}
        </dd>
        {entry.founding_year && (
          <>
            <dt className="font-semibold text-text-muted">Founded</dt>
            <dd>{entry.founding_year}</dd>
          </>
        )}
        <dt className="font-semibold text-text-muted">Last verified</dt>
        <dd className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {entry.last_verified}
        </dd>
      </dl>

      {entry.tags.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-text-muted">Tags</h2>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface-alt px-2.5 py-0.5 text-sm text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold">Related organisations</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/entry/${r.slug}`}
                  className="rounded-full bg-surface-alt px-3 py-1 text-sm hover:bg-brand-soft hover:text-brand"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.source && (
        <p className="mt-6 text-xs text-text-muted">
          Verified via: {entry.source}
        </p>
      )}
    </main>
  );
}

export async function generateStaticParams() {
  return getAllEntries().map((e) => ({ slug: e.slug }));
}
