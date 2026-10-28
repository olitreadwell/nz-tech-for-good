import { getAllEntries } from '@/lib/data';

import { SavedClient } from './SavedClient';

export default function SavedPage() {
  const entries = getAllEntries().map(({ slug, name }) => ({ slug, name }));
  return <SavedClient entries={entries} />;
}
