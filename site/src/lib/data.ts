/**
 * Build-time data loader for the NZ Tech-for-Good directory.
 *
 * Reads every YAML file in ../../data/entries (the single source of truth,
 * shared with scripts/build_guide.py) and derives everything the site needs:
 * typed entries, domain / region / tag indexes, and the resolved relationship
 * graph used by the ecosystem page. Nothing here invents data — a relationship
 * line only exists if it is recorded in an entry's `related_to`.
 *
 * The domain labels and the related_to resolution mirror scripts/build_guide.py
 * so the site and GUIDE.md stay consistent.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRIES_DIR = path.resolve(HERE, "../../../data/entries");
const DOMAIN_DESCRIPTIONS_PATH = path.resolve(
  HERE,
  "../../../data/domain-descriptions.yaml"
);

export interface Person {
  name: string;
  role: string;
  linkedin_url: string;
}

export interface Entry {
  slug: string;
  name: string;
  domain: string;
  domainLabel: string;
  what: string;
  region: string;
  website: string;
  github: string;
  linkedin_org: string;
  community_url: string;
  events_url: string;
  linkedin_people: Person[];
  tags: string[];
  related_to: string[];
  source: string;
  founding_year: number | null;
  takes_contributors: boolean | null;
  careers_url: string;
  last_verified: string;
}

/** Human-friendly domain names, mirroring scripts/build_guide.py. */
export const DOMAIN_LABELS: Record<string, string> = {
  "open-data": "Open Data",
  "worker-coop / platform-coop tech": "Worker & Platform Co-ops",
  "civic-tech": "Civic Tech",
  "human-rights tech": "Human Rights Tech",
  "green / climate-tech": "Green & Climate Tech",
  "crisis / humanitarian-tech": "Crisis & Humanitarian Tech",
  "journalism / media-tech": "Journalism & Media Tech",
  "nonprofit / NGO tech": "Nonprofit & NGO Tech",
  govtech: "GovTech",
  "Māori data sovereignty / indigenous data": "Māori Data Sovereignty",
  "disability & accessibility tech": "Disability & Accessibility Tech",
  "research / education tech": "Research & Education Tech",
  "legal-aid / justice tech": "Legal Aid & Justice Tech",
  "refugee / migrant support tech": "Refugee & Migrant Support Tech",
  "iwi / Māori tech initiatives": "Iwi & Māori Tech Initiatives",
  "makerspaces / hackerspaces": "Makerspaces & Hackerspaces",
  "mental-health tech": "Mental Health Tech",
  "health tech for good / hauora Māori": "Health Tech for Good / Hauora Māori",
  "food-rescue / food-security tech": "Food Rescue & Food Security Tech",
  "financial-inclusion / fintech-for-good": "Financial Inclusion & Fintech for Good",
  "education equity tech": "Education Equity Tech",
  "digital-inclusion": "Digital Inclusion",
  "tech-ethics / responsible-AI": "Tech Ethics & Responsible AI",
  "volunteering / giving platforms": "Volunteering & Giving Platforms",
  "housing / homelessness tech": "Housing & Homelessness Tech",
  "disability employment tech": "Disability Employment Tech",
  "environmental citizen-science": "Environmental Citizen Science",
};

export function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] ?? domain;
}

/** Short, plain-language explainer per domain, shared with GUIDE.md. */
const DOMAIN_DESCRIPTIONS: Record<string, string> = (yaml.load(
  readFileSync(DOMAIN_DESCRIPTIONS_PATH, "utf8")
) ?? {}) as Record<string, string>;

export function domainDescription(domain: string): string {
  return DOMAIN_DESCRIPTIONS[domain] ?? "";
}

/** URL-safe slug for a domain, region, or tag (used for page routes). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadRawEntries(): Entry[] {
  const files = readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .sort();
  const entries: Entry[] = [];
  for (const file of files) {
    const raw = yaml.load(readFileSync(path.join(ENTRIES_DIR, file), "utf8")) as
      | Record<string, unknown>
      | null;
    if (!raw || typeof raw !== "object" || !raw.name) continue;
    const domain = String(raw.domain ?? "");
    entries.push({
      slug: file.replace(/\.yaml$/, ""),
      name: String(raw.name),
      domain,
      domainLabel: domainLabel(domain),
      what: String(raw.what ?? ""),
      region: String(raw.region ?? ""),
      website: String(raw.website ?? ""),
      github: String(raw.github ?? ""),
      linkedin_org: String(raw.linkedin_org ?? ""),
      community_url: String(raw.community_url ?? ""),
      events_url: String(raw.events_url ?? ""),
      linkedin_people: (raw.linkedin_people as Person[]) ?? [],
      tags: (raw.tags as string[]) ?? [],
      related_to: (raw.related_to as string[]) ?? [],
      source: String(raw.source ?? ""),
      founding_year: (raw.founding_year as number | null) ?? null,
      takes_contributors: (raw.takes_contributors as boolean | null) ?? null,
      careers_url: String(raw.careers_url ?? ""),
      last_verified: String(raw.last_verified ?? ""),
    });
  }
  // Stable alphabetical order regardless of filesystem order.
  entries.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  return entries;
}

export const entries: Entry[] = loadRawEntries();

// --- indexes -------------------------------------------------------------

export interface Domain {
  key: string;
  label: string;
  slug: string;
  count: number;
}
export interface Facet {
  name: string;
  slug: string;
  count: number;
}

function countBy(getKey: (e: Entry) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of entries) {
    const k = getKey(e);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export const domains: Domain[] = [...countBy((e) => e.domain).entries()]
  .map(([key, count]) => ({ key, label: domainLabel(key), slug: slugify(key), count }))
  .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

export const regions: Facet[] = [...countBy((e) => e.region).entries()]
  .map(([name, count]) => ({ name, slug: slugify(name), count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export const tags: Facet[] = (() => {
  const m = new Map<string, number>();
  for (const e of entries) for (const t of e.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
})();

export const totalEntries = entries.length;

/** Entries sorted by last_verified date, newest first. */
export const recentEntries: Entry[] = [...entries].sort((a, b) => {
  const da = a.last_verified || "";
  const db = b.last_verified || "";
  return db.localeCompare(da);
});

export function entriesByDomain(domainKey: string): Entry[] {
  return entries.filter((e) => e.domain === domainKey);
}
export function entriesByRegion(region: string): Entry[] {
  return entries.filter((e) => e.region === region);
}
export function domainBySlug(slug: string): Domain | undefined {
  return domains.find((d) => d.slug === slug);
}
export function regionBySlug(slug: string): Facet | undefined {
  return regions.find((r) => r.slug === slug);
}

// --- relationship graph (mirrors scripts/build_guide.py) -----------------

const names = new Set(entries.map((e) => e.name));
function norm(s: string): string {
  return s
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim()
    .toLowerCase();
}
const nameMap = new Map(entries.map((e) => [norm(e.name), e.name]));
const entryByName = new Map(entries.map((e) => [e.name, e]));

/** Resolve a related_to reference to a real entry name, or null if none. */
function resolve(ref: string): string | null {
  if (names.has(ref)) return ref;
  const n = norm(ref);
  if (nameMap.has(n)) return nameMap.get(n)!;
  for (const name of names) {
    const nn = norm(name);
    if (nn.includes(n) || n.includes(nn)) return name;
  }
  return null;
}

/** Undirected, de-duplicated entry-to-entry edges (both ends real entries). */
export const edges: Array<[string, string]> = (() => {
  const set = new Set<string>();
  for (const e of entries) {
    for (const ref of e.related_to) {
      const target = resolve(ref);
      if (!target || target === e.name) continue;
      const key = [e.name, target].sort().join(" ");
      set.add(key);
    }
  }
  return [...set].sort().map((k) => k.split(" ") as [string, string]);
})();

export interface DomainEdge {
  a: string; // domain key
  b: string; // domain key
  count: number;
}

/** Cross-domain edge counts for the ecosystem overview. */
export const domainEdges: DomainEdge[] = (() => {
  const counts = new Map<string, number>();
  for (const [a, b] of edges) {
    const da = entryByName.get(a)!.domain;
    const db = entryByName.get(b)!.domain;
    if (da === db) continue;
    const key = [da, db].sort().join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split(" ");
      return { a, b, count };
    })
    .sort((x, y) => y.count - x.count);
})();

/** Within-domain edges, keyed by domain, for the domain close-up diagrams. */
export function internalEdges(domainKey: string): Array<[string, string]> {
  return edges.filter(([a, b]) => {
    const da = entryByName.get(a)!.domain;
    const db = entryByName.get(b)!.domain;
    return da === domainKey && db === domainKey;
  });
}

/** Entries a given entry is connected to (resolved, real names only). */
export function relatedEntries(entry: Entry): Entry[] {
  const out: Entry[] = [];
  for (const [a, b] of edges) {
    if (a === entry.name) out.push(entryByName.get(b)!);
    else if (b === entry.name) out.push(entryByName.get(a)!);
  }
  return out.sort((x, y) => x.name.localeCompare(y.name));
}
