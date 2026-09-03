'use client';

import { useEffect, useRef } from 'react';

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

export function MapClient({ entries }: { entries: Entry[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      const map = L.map(mapRef.current).setView([-40.9, 174.0], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM',
        maxZoom: 18,
      }).addTo(map);

      const regionEntries: Record<string, Entry[]> = {};
      entries.forEach((e) => {
        if (!regionEntries[e.region]) regionEntries[e.region] = [];
        regionEntries[e.region].push(e);
      });

      const regions = [...new Set(entries.map((e) => e.region))].filter((r) => REGION_COORDS[r]);

      regions.forEach((name) => {
        const list = regionEntries[name] || [];
        L.circleMarker(REGION_COORDS[name], {
          radius: Math.max(8, Math.min(30, list.length * 2.5)),
          fillColor: '#2563eb',
          color: '#fff',
          weight: 2,
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindTooltip(name + ' (' + list.length + ')');
      });

      // Search
      const search = document.getElementById('map-search') as HTMLInputElement;
      const container = document.getElementById('map-entries')!;
      if (search) {
        search.addEventListener('input', () => {
          const q = search.value.toLowerCase();
          if (!q) {
            container.innerHTML = '';
            return;
          }
          const filtered = entries.filter((e) =>
            (e.name + ' ' + e.what + ' ' + e.tags.join(' ')).toLowerCase().includes(q)
          );
          container.innerHTML =
            "<h3 class='font-bold text-sm mb-2'>Results (" +
            filtered.length +
            ')</h3>' +
            filtered
              .slice(0, 20)
              .map(
                (e) =>
                  "<div class='mb-1 text-sm'><a href='/entry/" +
                  e.slug +
                  "/' class='text-brand hover:underline'>" +
                  e.name +
                  "</a> <span class='text-text-muted'>· " +
                  e.domainLabel +
                  ' · ' +
                  e.region +
                  '</span></div>'
              )
              .join('');
        });
      }
    };
    loadLeaflet();
  }, [entries]);

  const regionEntries: Record<string, Entry[]> = {};
  entries.forEach((e) => {
    if (!regionEntries[e.region]) regionEntries[e.region] = [];
    regionEntries[e.region].push(e);
  });
  const regionList = [...new Set(entries.map((e) => e.region))]
    .map((r) => ({ name: r, count: (regionEntries[r] || []).length }))
    .sort((a, b) => b.count - a.count);

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
            placeholder="Search entries..."
            className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <details className="lg:hidden mb-3">
            <summary className="cursor-pointer text-sm font-medium text-text-muted">
              Regions ({regionList.length})
            </summary>
            <div className="mt-2 max-h-40 overflow-y-auto">
              {regionList.map((r) => (
                <div key={r.name} className="rounded px-2 py-1 text-sm">
                  {r.name} <span className="text-text-muted">({r.count})</span>
                </div>
              ))}
            </div>
          </details>
          <div className="hidden max-h-[55vh] overflow-y-auto lg:block">
            {regionList.map((r) => (
              <div key={r.name} className="rounded px-2 py-1 text-sm">
                {r.name} <span className="text-text-muted">({r.count})</span>
              </div>
            ))}
          </div>
          <div id="map-entries" className="mt-3" />
        </div>
      </div>
    </main>
  );
}
