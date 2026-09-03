import Link from 'next/link';
import { BarChart3, FolderOpen, MapPin, Link2, Clock } from 'lucide-react';

import { getAllEntries, getDomains, getRegions } from '@/lib/data';

export default function StatsPage() {
  const entries = getAllEntries();
  const domains = getDomains();
  const regions = getRegions();

  const withGithub = entries.filter((e) => e.github).length;
  const withLinkedin = entries.filter((e) => e.linkedin_org).length;
  const withCareers = entries.filter((e) => e.careers_url).length;
  const withCommunity = entries.filter((e) => e.community_url).length;
  const withEvents = entries.filter((e) => e.events_url).length;
  const withContributors = entries.filter((e) => e.takes_contributors === true).length;
  const withRelated = entries.filter((e) => e.related_to.length > 0).length;

  // Founding decade distribution
  const decades: Record<string, number> = {
    'Before 2000': 0,
    '2000s': 0,
    '2010s': 0,
    '2020s': 0,
    Unknown: 0,
  };
  for (const e of entries) {
    if (!e.founding_year) decades.Unknown++;
    else if (e.founding_year < 2000) decades['Before 2000']++;
    else if (e.founding_year < 2010) decades['2000s']++;
    else if (e.founding_year < 2020) decades['2010s']++;
    else decades['2020s']++;
  }
  const maxDecade = Math.max(...Object.values(decades), 1);

  const mature = entries.filter((e) => e.founding_year && e.founding_year < 2010).length;
  const growing = entries.filter(
    (e) => e.founding_year && e.founding_year >= 2010 && e.founding_year < 2020
  ).length;
  const emerging = entries.filter((e) => e.founding_year && e.founding_year >= 2020).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Stats</h1>
      <p className="mt-2 text-text-muted">
        Key numbers about the directory: entry growth, domain coverage, and data completeness.
      </p>

      {/* Hero stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FolderOpen} value={entries.length} label="organisations" />
        <StatCard icon={BarChart3} value={domains.length} label="domains" />
        <StatCard icon={MapPin} value={regions.length} label="regions" />
        <StatCard icon={Link2} value={withRelated} label="cross-linked" />
      </div>

      {/* Maturity */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Organisation maturity</h2>
        <p className="text-sm text-text-muted">
          Based on verified founding years ({entries.length - decades.Unknown} of {entries.length}{' '}
          known).
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="text-2xl font-extrabold text-brand">{mature}</div>
            <div className="text-xs text-text-muted">Established (&lt;2010)</div>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="text-2xl font-extrabold text-brand">{growing}</div>
            <div className="text-xs text-text-muted">Growing (2010–19)</div>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="text-2xl font-extrabold text-brand">{emerging}</div>
            <div className="text-xs text-text-muted">Emerging (2020+)</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {Object.entries(decades).map(([decade, count]) => (
            <div key={decade} className="flex items-center gap-2 text-sm">
              <span className="w-24 text-right text-text-muted">{decade}</span>
              <div className="flex-1">
                <div
                  className="h-5 rounded bg-brand"
                  style={{
                    width: `${Math.round((count / maxDecade) * 100)}%`,
                    minWidth: count > 0 ? 8 : 0,
                  }}
                />
              </div>
              <span className="w-8 text-right text-text-muted">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Regions</h2>
        <div className="mt-3 space-y-1">
          {regions.slice(0, 16).map((r) => (
            <div key={r.name} className="flex items-center gap-2 text-sm">
              <span className="w-28 text-right text-text-muted truncate">
                <Link href={`/directory?region=${r.slug}`} className="hover:text-brand">
                  {r.name}
                </Link>
              </span>
              <div className="flex-1">
                <div
                  className="h-5 rounded bg-brand-soft"
                  style={{
                    width: `${Math.round((r.count / regions[0].count) * 100)}%`,
                    minWidth: r.count > 0 ? 8 : 0,
                  }}
                />
              </div>
              <span className="w-8 text-right text-text-muted">{r.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Data completeness */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Data completeness</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left font-semibold">Field</th>
                <th className="py-2 text-right font-semibold">Filled</th>
                <th className="py-2 text-right font-semibold">Missing</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5">GitHub</td>
                <td className="text-right">{withGithub}</td>
                <td className="text-right text-text-muted">{entries.length - withGithub}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5">LinkedIn (org)</td>
                <td className="text-right">{withLinkedin}</td>
                <td className="text-right text-text-muted">{entries.length - withLinkedin}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5">Careers URL</td>
                <td className="text-right">{withCareers}</td>
                <td className="text-right text-text-muted">{entries.length - withCareers}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5">Community URL</td>
                <td className="text-right">{withCommunity}</td>
                <td className="text-right text-text-muted">{entries.length - withCommunity}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5">Events URL</td>
                <td className="text-right">{withEvents}</td>
                <td className="text-right text-text-muted">{entries.length - withEvents}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5">Takes contributors</td>
                <td className="text-right">{withContributors}</td>
                <td className="text-right text-text-muted">{entries.length - withContributors}</td>
              </tr>
              <tr>
                <td className="py-1.5">Cross-linked</td>
                <td className="text-right">{withRelated}</td>
                <td className="text-right text-text-muted">{entries.length - withRelated}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-brand" />
      <div className="mt-1 text-2xl font-extrabold text-brand">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
