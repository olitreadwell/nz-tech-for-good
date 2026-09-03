import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

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

const ENTRIES_DIR = path.resolve(process.cwd(), '../../data/entries');

let _entries: Entry[] | null = null;

export function getAllEntries(): Entry[] {
  if (_entries) return _entries;
  const files = fs
    .readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort();
  const entries: Entry[] = [];
  for (const file of files) {
    const raw = yaml.load(fs.readFileSync(path.join(ENTRIES_DIR, file), 'utf8')) as Record<
      string,
      unknown
    > | null;
    if (!raw?.name) continue;
    const domain = String(raw.domain ?? '');
    entries.push({
      slug: file.replace(/\.yaml$/, ''),
      name: String(raw.name),
      domain,
      domainLabel: domainLabel(domain),
      what: String(raw.what ?? ''),
      region: String(raw.region ?? ''),
      website: String(raw.website ?? ''),
      github: String(raw.github ?? ''),
      linkedin_org: String(raw.linkedin_org ?? ''),
      community_url: String(raw.community_url ?? ''),
      events_url: String(raw.events_url ?? ''),
      tags: (raw.tags as string[]) ?? [],
      related_to: (raw.related_to as string[]) ?? [],
      source: String(raw.source ?? ''),
      founding_year: (raw.founding_year as number | null) ?? null,
      takes_contributors: (raw.takes_contributors as boolean | null) ?? null,
      careers_url: String(raw.careers_url ?? ''),
      last_verified: String(raw.last_verified ?? ''),
    });
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  _entries = entries;
  return entries;
}

export function getDomains() {
  const counts = new Map<string, number>();
  for (const e of getAllEntries()) {
    counts.set(e.domain, (counts.get(e.domain) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: domainLabel(key),
      slug: key.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getRegions() {
  const counts = new Map<string, number>();
  for (const e of getAllEntries()) {
    counts.set(e.region, (counts.get(e.region) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
