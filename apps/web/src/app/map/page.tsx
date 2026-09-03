import { getAllEntries } from '@/lib/data';
import { MapClient } from './MapClient';

export default function MapPage() {
  const entries = getAllEntries();
  return <MapClient entries={entries} />;
}
