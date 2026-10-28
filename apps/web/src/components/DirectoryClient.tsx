'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { Entry, getDomains, getRegions } from '@/lib/data';
import {
  PAGE_SIZES,
  clampPage,
  readDirectoryState,
  writeDirectoryState,
  type PageSize,
} from '@/lib/directory-filters';
import { toSlug } from '@/lib/slug';
import { withBasePath } from '@/lib/site';
import { EntryCard } from '@/components/EntryCard';

interface DirectoryClientProps {
  entries: Entry[];
  domains: ReturnType<typeof getDomains>;
  regions: ReturnType<typeof getRegions>;
}

const SORT_LABELS: Record<string, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'verified-desc': 'Recently verified',
};

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
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const restoredUrl = useRef(false);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const initial = readDirectoryState(window.location.search);
    setSearch(initial.q);
    setDomain(initial.domain);
    setRegion(initial.region);
    setSort(initial.sort);
    setPageSize(initial.perPage);
    restoredUrl.current = true;
  }, []);

  useEffect(() => {
    if (!restoredUrl.current) return;
    const query = writeDirectoryState({ q: search, domain, region, sort, perPage: pageSize });
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query}${window.location.hash}`
    );
  }, [search, domain, region, sort, pageSize]);

  const clear = useCallback(() => {
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
    setPageSize(20);
    setPage(1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      clear();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [clear]);

  const filtered = useMemo(() => {
    let result = entries;
    const q = deferredSearch.toLowerCase();
    if (q)
      result = result.filter((e) =>
        (e.name + ' ' + e.what + ' ' + e.tags.join(' ')).toLowerCase().includes(q)
      );
    if (domain) result = result.filter((e) => e.domain === domain);
    if (region) result = result.filter((e) => toSlug(e.region) === region);
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

    result = [...result];
    if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'verified-desc')
      result.sort((a, b) => b.last_verified.localeCompare(a.last_verified));
    return result;
  }, [
    entries,
    deferredSearch,
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

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = clampPage(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const goToPage = (nextPage: number) => {
    setPage(clampPage(nextPage, totalPages));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const randomEntry = () => {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    window.location.href = withBasePath(`/entry/${pick.slug}`);
  };

  const toggle = (setter: Dispatch<SetStateAction<boolean>>) => () => {
    setter((value) => !value);
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

      <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-3">
          <input
            ref={searchRef}
            type="search"
            aria-label="Search entries"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${entries.length} organisations…`}
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm"
          />
          <select
            aria-label="Filter by domain"
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
            aria-label="Filter by region"
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
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={contributors} onChange={toggle(setContributors)} />{' '}
            Contributors
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={careers} onChange={toggle(setCareers)} /> Careers
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={remote} onChange={toggle(setRemote)} /> Remote
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={github} onChange={toggle(setGithub)} /> GitHub
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={linkedin} onChange={toggle(setLinkedin)} /> LinkedIn
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={community} onChange={toggle(setCommunity)} /> Community
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={events} onChange={toggle(setEvents)} /> Events
          </label>
          <select
            aria-label="Filter by founding decade"
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
            className="text-sm text-text-muted underline hover:text-text"
          >
            Clear all
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-text-muted">Sort</span>
          <select
            aria-label="Sort entries"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded border border-border bg-surface-alt px-2 py-1 text-sm"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            {SORT_LABELS[sort] ?? sort}
          </span>
          <label className="inline-flex items-center gap-1 text-text-muted">
            Per page
            <select
              aria-label="Entries per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as PageSize);
                setPage(1);
              }}
              className="rounded border border-border bg-surface-alt px-2 py-1 text-sm text-text"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
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

      <ul
        ref={resultsRef}
        id="directory-results"
        className="mt-6 grid scroll-mt-24 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-alt disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
