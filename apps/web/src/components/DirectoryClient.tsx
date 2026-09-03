'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

import type { Entry, getDomains, getRegions } from '@/lib/data';
import { EntryCard } from '@/components/EntryCard';

const PAGE_SIZE = 20;

interface DirectoryClientProps {
  entries: Entry[];
  domains: ReturnType<typeof getDomains>;
  regions: ReturnType<typeof getRegions>;
}

export default function DirectoryClient({ entries, domains, regions }: DirectoryClientProps) {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [region, setRegion] = useState('');
  const [contributors, setContributors] = useState(false);
  const [careers, setCareers] = useState(false);
  const [remote, setRemote] = useState(false);
  const [github, setGithub] = useState(false);
  const [linkedin, setLinkedin] = useState(false);
  const [community, setCommunity] = useState(false);
  const [events, setEvents] = useState(false);
  const [decade, setDecade] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = entries;
    const q = search.toLowerCase();
    if (q)
      result = result.filter((e) =>
        (e.name + ' ' + e.what + ' ' + e.tags.join(' ')).toLowerCase().includes(q)
      );
    if (domain) result = result.filter((e) => e.domain === domain);
    if (region)
      result = result.filter((e) => e.region.toLowerCase().replace(/[^a-z0-9]+/g, '-') === region);
    if (contributors) result = result.filter((e) => e.takes_contributors === true);
    if (careers) result = result.filter((e) => e.careers_url);
    if (remote) result = result.filter((e) => e.tags.includes('remote'));
    if (github) result = result.filter((e) => e.github);
    if (linkedin) result = result.filter((e) => e.linkedin_org);
    if (community) result = result.filter((e) => e.community_url);
    if (events) result = result.filter((e) => e.events_url);
    if (decade) {
      result = result.filter((e) => {
        const fy = e.founding_year ?? 0;
        if (decade === 'pre-2000') return fy < 2000 && fy > 0;
        if (decade === '2000s') return fy >= 2000 && fy < 2010;
        if (decade === '2010s') return fy >= 2010 && fy < 2020;
        if (decade === '2020s') return fy >= 2020;
        return true;
      });
    }

    // Sort
    result = [...result];
    if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'verified-desc')
      result.sort((a, b) => b.last_verified.localeCompare(a.last_verified));
    return result;
  }, [
    entries,
    search,
    domain,
    region,
    contributors,
    careers,
    remote,
    github,
    linkedin,
    community,
    events,
    decade,
    sort,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clear = () => {
    setSearch('');
    setDomain('');
    setRegion('');
    setContributors(false);
    setCareers(false);
    setRemote(false);
    setGithub(false);
    setLinkedin(false);
    setCommunity(false);
    setEvents(false);
    setDecade('');
    setSort('name-asc');
    setPage(1);
  };

  const randomEntry = () => {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    window.location.href = `/entry/${pick.slug}`;
  };

  const toggle = (setter: (fn: (prev: boolean) => boolean) => void) => () => {
    setter((v) => !v);
    setPage(1);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Directory</h1>
        <p className="mt-2 text-text-muted">
          {entries.length} organisations. Filter by domain, region, tag, or any field.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${entries.length} organisations…`}
            className="flex-1 min-w-[200px] rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
          />
          <select
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label} ({d.count})
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.name} value={r.slug}>
                {r.name} ({r.count})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={contributors} onChange={toggle(setContributors)} />{' '}
            Contributors
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={careers} onChange={toggle(setCareers)} /> Careers
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={remote} onChange={toggle(setRemote)} /> Remote
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={github} onChange={toggle(setGithub)} /> GitHub
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={linkedin} onChange={toggle(setLinkedin)} /> LinkedIn
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={community} onChange={toggle(setCommunity)} /> Community
          </label>
          <label className="cursor-pointer inline-flex items-center gap-1">
            <input type="checkbox" checked={events} onChange={toggle(setEvents)} /> Events
          </label>
          <select
            value={decade}
            onChange={(e) => {
              setDecade(e.target.value);
              setPage(1);
            }}
            className="rounded border border-border bg-surface-alt px-2 py-0.5 text-sm"
          >
            <option value="">Any decade</option>
            <option value="pre-2000">Pre-2000s</option>
            <option value="2000s">2000s</option>
            <option value="2010s">2010s</option>
            <option value="2020s">2020s</option>
          </select>
          <button
            type="button"
            onClick={clear}
            className="text-text-muted hover:text-text text-sm underline"
          >
            Clear all
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded border border-border bg-surface-alt px-2 py-1 text-sm"
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="verified-desc">Recently verified</option>
          </select>
          <button
            type="button"
            onClick={randomEntry}
            className="rounded border border-border px-3 py-1 text-sm hover:bg-surface-alt"
          >
            🎲 Random
          </button>
          <span className="ml-auto text-text-muted">
            {filtered.length === entries.length
              ? `${entries.length} total`
              : `${filtered.length} of ${entries.length}`}
          </span>
        </div>
      </div>

      {/* Entry list */}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((entry) => (
          <EntryCard key={entry.slug} {...entry} />
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-text-muted">
          No organisations match those filters.{' '}
          <button type="button" onClick={clear} className="underline hover:text-text">
            Clear all
          </button>
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
