'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import type { LeafletMap, LeafletNamespace } from '@/lib/leaflet-types';

interface Entry {
  slug: string;
  name: string;
  domainLabel: string;
  region: string;
  what: string;
  tags: string[];
}

const REGION_COORDS: Record<string, [number, number]> = {
  national: [-41, 173],
  northland: [-35.7, 174.3],
  auckland: [-36.85, 174.78],
  waikato: [-37.78, 175.28],
  'bay-of-plenty': [-37.68, 176.17],
  gisborne: [-38.66, 178.02],
  'hawkes-bay': [-39.5, 176.9],
  taranaki: [-39.06, 174.07],
  wellington: [-41.29, 174.78],
  'tasman-nelson': [-41.27, 173.28],
  marlborough: [-41.5, 173.9],
  'west-coast': [-42.5, 171.5],
  canterbury: [-43.53, 172.63],
  otago: [-45.87, 170.5],
  southland: [-46.4, 168.35],
};

async function loadLeafletScript(): Promise<LeafletNamespace | null> {
  const leafletWindow = window as Window & { L?: LeafletNamespace };
  if (leafletWindow.L) return leafletWindow.L;
  const existing = document.querySelector<HTMLScriptElement>('script[data-leaflet]');
  if (existing) {
    await new Promise<void>((resolve) => {
      if (leafletWindow.L) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
    });
    return leafletWindow.L ?? null;
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.dataset.leaflet = 'true';
    script.onload = () => resolve(leafletWindow.L ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

function ensureLeafletStyles() {
  if (document.querySelector('link[data-leaflet-css]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.dataset.leafletCss = 'true';
  document.head.appendChild(link);
}

export function MapClient({ entries }: { entries: Entry[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [query, setQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const regionEntries = useMemo(() => {
    const grouped = new Map<string, Entry[]>();
    for (const entry of entries) {
      const list = grouped.get(entry.region) ?? [];
      list.push(entry);
      grouped.set(entry.region, list);
    }
    return grouped;
  }, [entries]);

  const regionList = useMemo(
    () =>
      [...regionEntries.entries()]
        .map(([name, list]) => ({ name, count: list.length }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    [regionEntries]
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return entries
      .filter((entry) =>
        (entry.name + ' ' + entry.what + ' ' + entry.tags.join(' ')).toLowerCase().includes(needle)
      )
      .slice(0, 20);
  }, [entries, query]);

  useEffect(() => {
    let cancelled = false;
    ensureLeafletStyles();

    const createMap = async () => {
      const leaflet = await loadLeafletScript();
      if (cancelled || !leaflet || !mapRef.current) return;

      const map = leaflet.map(mapRef.current).setView([-40.9, 174.0], 6);
      mapInstanceRef.current = map;
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OSM',
          maxZoom: 18,
        })
        .addTo(map);

      for (const [name, list] of regionEntries) {
        const coords = REGION_COORDS[name];
        if (!coords) continue;
        leaflet
          .circleMarker(coords, {
            radius: Math.max(8, Math.min(30, list.length * 2.5)),
            fillColor: '#2563eb',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.8,
          })
          .addTo(map)
          .bindTooltip(`${name} (${list.length})`)
          .on('click', () => setSelectedRegion(name));
      }
    };

    void createMap();
    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [regionEntries]);

  const selectRegion = (name: string) => {
    setSelectedRegion(name);
    const coords = REGION_COORDS[name];
    if (coords) mapInstanceRef.current?.flyTo?.(coords, 8);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Map</h1>
      <p className="mt-2 text-text-muted">
        {entries.length} organisations across {regionList.length} regions.
      </p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div
          ref={mapRef}
          className="h-[40vh] min-h-[300px] w-full rounded-lg border border-border lg:h-[65vh] lg:flex-1"
        />
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <input
            type="search"
            id="map-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search entries..."
            className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <details className="mb-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium text-text-muted">
              Regions ({regionList.length})
            </summary>
            <div className="mt-2 max-h-40 overflow-y-auto">
              {regionList.map((region) => (
                <button
                  key={region.name}
                  type="button"
                  onClick={() => selectRegion(region.name)}
                  className={`block w-full rounded px-2 py-1 text-left text-sm ${
                    selectedRegion === region.name ? 'bg-brand-soft font-medium text-brand' : ''
                  }`}
                >
                  {region.name} <span className="text-text-muted">({region.count})</span>
                </button>
              ))}
            </div>
          </details>
          <div className="hidden max-h-[55vh] overflow-y-auto lg:block">
            {regionList.map((region) => (
              <button
                key={region.name}
                type="button"
                onClick={() => selectRegion(region.name)}
                aria-pressed={selectedRegion === region.name}
                className={`block w-full rounded px-2 py-1 text-left text-sm ${
                  selectedRegion === region.name ? 'bg-brand-soft font-medium text-brand' : ''
                }`}
              >
                {region.name} <span className="text-text-muted">({region.count})</span>
              </button>
            ))}
          </div>
          <div id="map-entries" className="mt-3">
            {query && <h3 className="mb-2 text-sm font-bold">Results ({results.length})</h3>}
            {results.map((entry) => (
              <div key={entry.slug} className="mb-1 text-sm">
                <Link href={`/entry/${entry.slug}`} className="text-brand hover:underline">
                  {entry.name}
                </Link>{' '}
                <span className="text-text-muted">
                  · {entry.domainLabel} · {entry.region}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
