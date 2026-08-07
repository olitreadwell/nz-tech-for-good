import Link from "next/link";
import { MessageCircle, Calendar, Users, FileText } from "lucide-react";

import { getAllEntries } from "@/lib/data";

export default function GetInvolvedPage() {
  const entries = getAllEntries();
  const communities = entries.filter((e) => e.community_url);
  const events = entries.filter((e) => e.events_url);
  const volunteering = entries.filter(
    (e) => e.careers_url || e.takes_contributors === true,
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Get Involved</h1>
      <p className="mt-2 text-lg text-text-muted">
        This directory lists organisations. This page is about what to do next:
        who to talk to, where to show up, and how to help.
      </p>

      <Section
        icon={MessageCircle}
        title="Join a community"
        items={communities}
        linkKey="community_url"
        linkLabel="Join"
        empty="No communities listed yet. Know an active NZ tech-for-good Slack or Discord? Suggest it on GitHub."
      />

      <Section
        icon={Calendar}
        title="Find an event"
        items={events}
        linkKey="events_url"
        linkLabel="Events"
        empty="No events listed yet."
      />

      <Section
        icon={Users}
        title="Volunteer or work with someone"
        items={volunteering}
        linkKey="careers_url"
        linkLabel="Careers"
        empty="No volunteering opportunities listed yet."
      />

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <FileText className="h-5 w-5" /> Learn about a domain
        </h2>
        <p className="mt-1 text-text-muted">
          Not sure where you would fit? Browse the areas this directory covers.
        </p>
        <Link
          href="/directory"
          className="mt-3 inline-block rounded-lg bg-brand px-5 py-2 font-semibold text-white"
        >
          Browse the directory
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Add or fix an entry</h2>
        <p className="mt-1 text-text-muted">
          Know a group that should be listed, or spotted something out of date?
          No coding needed.
        </p>
        <div className="mt-3 flex gap-3">
          <a
            href="https://github.com/olitreadwell/nz-tech-for-good/issues/new?template=add-entry.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-white"
          >
            Suggest an entry
          </a>
          <a
            href="https://github.com/olitreadwell/nz-tech-for-good/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-5 py-2 font-semibold hover:bg-surface-alt"
          >
            Contributor guide
          </a>
        </div>
      </section>
    </main>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  linkKey,
  linkLabel,
  empty,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: ReturnType<typeof getAllEntries>;
  linkKey: string;
  linkLabel: string;
  empty: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Icon className="h-5 w-5" /> {title}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((e) => (
            <li
              key={e.slug}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <Link
                  href={`/entry/${e.slug}`}
                  className="font-semibold hover:text-brand"
                >
                  {e.name}
                </Link>
                <p className="text-sm text-text-muted">{e.what}</p>
              </div>
              {e[linkKey as keyof typeof e] && (
                <a
                  href={String(e[linkKey as keyof typeof e])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 flex-shrink-0 rounded-lg border border-border px-3 py-1 text-sm font-medium hover:bg-surface-alt"
                >
                  {linkLabel} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-text-muted">{empty}</p>
      )}
    </section>
  );
}
