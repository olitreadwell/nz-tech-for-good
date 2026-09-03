const SITE_BASE_URL = 'https://nz-tech-for-good.vercel.app';
const REPO_BASE_URL = 'https://github.com/olitreadwell/nz-tech-for-good';

export interface EntryFeedbackInput {
  slug: string;
  name: string;
}

/**
 * Builds a pre-filled GitHub issue URL for correcting or updating an entry.
 * Falls back to the entry slug when the name is missing.
 */
export function buildEntryFeedbackUrl({ slug, name }: EntryFeedbackInput): string {
  const entryName = name.trim() || slug;
  const title = `Entry update: ${entryName}`;
  const body = [
    `**Entry:** ${entryName}`,
    `**Entry link:** ${SITE_BASE_URL}/entry/${slug}`,
    `**Data file:** ${REPO_BASE_URL}/blob/main/data/entries/${slug}.yaml`,
    '',
    'Spotted a mistake or have an update for this entry? Describe what should change below.',
  ].join('\n');

  return `${REPO_BASE_URL}/issues/new?title=${encodeURIComponent(
    title
  )}&body=${encodeURIComponent(body)}`;
}
