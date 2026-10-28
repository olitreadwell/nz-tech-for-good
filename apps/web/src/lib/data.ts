import fs from 'node:fs';
import path from 'node:path';

import { load as loadYaml } from 'js-yaml';

import { domainSlug } from '@/lib/domain-slug';
import { toSlug } from '@/lib/slug';

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
  tags: string[];
  related_to: string[];
  source: string;
  founding_year: number | null;
  takes_contributors: boolean | null;
  careers_url: string;
  last_verified: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  'open-data': 'Open Data',
  'civic-tech': 'Civic Tech',
  'green / climate-tech': 'Green & Climate Tech',
  'digital-inclusion': 'Digital Inclusion',
  'Māori data sovereignty / indigenous data': 'Māori Data Sovereignty',
  'iwi / Māori tech initiatives': 'Iwi & Māori Tech Initiatives',
  'housing / homelessness tech': 'Housing & Homelessness Tech',
  'health tech for good / hauora Māori': 'Health Tech / Hauora Māori',
  'food-rescue / food-security tech': 'Food Rescue & Food Security',
  'financial-inclusion / fintech-for-good': 'Financial Inclusion & Fintech',
  'disability employment tech': 'Disability Employment Tech',
  'mental-health tech': 'Mental Health Tech',
  'journalism / media-tech': 'Journalism & Media Tech',
  'disability & accessibility tech': 'Disability & Accessibility Tech',
  'volunteering / giving platforms': 'Volunteering & Giving',
  'worker-coop / platform-coop tech': 'Worker & Platform Co-ops',
  'nonprofit / NGO tech': 'Nonprofit & NGO Tech',
  'crisis / humanitarian-tech': 'Crisis & Humanitarian Tech',
  'human-rights tech': 'Human Rights Tech',
  'legal-aid / justice tech': 'Legal Aid & Justice Tech',
  'research / education tech': 'Research & Education Tech',
  'refugee / migrant support tech': 'Refugee & Migrant Support Tech',
  'education equity tech': 'Education Equity Tech',
  'tech-ethics / responsible-AI': 'Tech Ethics & Responsible AI',
  govtech: 'GovTech',
  'environmental citizen-science': 'Environmental Citizen Science',
  'makerspaces / hackerspaces': 'Makerspaces & Hackerspaces',
};

function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] ?? domain;
}

const ENTRIES_DIR = process.env.ENTRIES_DIR
  ? path.resolve(process.env.ENTRIES_DIR)
  : path.resolve(process.cwd(), '../../data/entries');

let _entries: Entry[] | null = null;

const REQUIRED_STRING_FIELDS = ['name', 'domain', 'what', 'region', 'source'] as const;

function requireString(raw: Record<string, unknown>, field: string, file: string): string {
  const value = raw[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid entry ${file}: "${field}" must be a non-empty string`);
  }
  return value;
}

function optionalString(raw: Record<string, unknown>, field: string): string {
  const value = raw[field];
  return typeof value === 'string' ? value : '';
}

function optionalStringArray(raw: Record<string, unknown>, field: string, file: string): string[] {
  const value = raw[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Invalid entry ${file}: "${field}" must be an array of strings`);
  }
  return value;
}

/** Build one validated entry from its YAML object. Throws with the file name. */
export function parseEntry(raw: Record<string, unknown>, file: string): Entry {
  for (const field of REQUIRED_STRING_FIELDS) requireString(raw, field, file);
  const domain = String(raw.domain);
  const tags = optionalStringArray(raw, 'tags', file);
  const relatedTo = optionalStringArray(raw, 'related_to', file);
  const foundingYear = raw.founding_year;
  if (foundingYear !== undefined && foundingYear !== null && typeof foundingYear !== 'number') {
    throw new Error(`Invalid entry ${file}: "founding_year" must be a number or null`);
  }
  const takesContributors = raw.takes_contributors;
  if (
    takesContributors !== undefined &&
    takesContributors !== null &&
    typeof takesContributors !== 'boolean'
  ) {
    throw new Error(`Invalid entry ${file}: "takes_contributors" must be a boolean or null`);
  }
  return {
    slug: file.replace(/\.yaml$/, ''),
    name: requireString(raw, 'name', file),
    domain,
    domainLabel: domainLabel(domain),
    what: requireString(raw, 'what', file),
    region: requireString(raw, 'region', file),
    website: optionalString(raw, 'website'),
    github: optionalString(raw, 'github'),
    linkedin_org: optionalString(raw, 'linkedin_org'),
    community_url: optionalString(raw, 'community_url'),
    events_url: optionalString(raw, 'events_url'),
    tags,
    related_to: relatedTo,
    source: requireString(raw, 'source', file),
    founding_year: typeof foundingYear === 'number' ? foundingYear : null,
    takes_contributors: typeof takesContributors === 'boolean' ? takesContributors : null,
    careers_url: optionalString(raw, 'careers_url'),
    last_verified: optionalString(raw, 'last_verified'),
  };
}

/** Load, validate, cache, and sort every directory entry. */
export function getAllEntries(): Entry[] {
  if (_entries) return _entries;
  let files: string[];
  try {
    files = fs
      .readdirSync(ENTRIES_DIR)
      .filter((f) => f.endsWith('.yaml'))
      .sort();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Could not read entries directory ${ENTRIES_DIR}: ${message}`);
    _entries = [];
    return _entries;
  }
  const entries: Entry[] = [];
  for (const file of files) {
    const raw = loadYaml(fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf8')) as Record<
      string,
      unknown
    > | null;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(`Invalid entry ${file}: root must be a YAML mapping`);
    }
    entries.push(parseEntry(raw, file));
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const names = new Set(entries.map((entry) => entry.name));
  for (const entry of entries) {
    for (const reference of entry.related_to) {
      if (!names.has(reference)) {
        console.warn(`Unresolved related_to in ${entry.slug}.yaml: "${reference}"`);
      }
    }
  }
  _entries = entries;
  return entries;
}

/** Domain keys with their display labels, slugs, and entry counts. */
export function getDomains() {
  const counts = new Map<string, number>();
  for (const e of getAllEntries()) {
    counts.set(e.domain, (counts.get(e.domain) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: domainLabel(key),
      slug: domainSlug(key),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Region names with stable slugs and entry counts. */
export function getRegions() {
  const counts = new Map<string, number>();
  for (const e of getAllEntries()) {
    counts.set(e.region, (counts.get(e.region) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: toSlug(name),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Most recent last_verified date in the directory, or an empty string. */
export function getLatestVerified(): string {
  return getAllEntries().reduce(
    (latest, entry) => (entry.last_verified > latest ? entry.last_verified : latest),
    ''
  );
}
