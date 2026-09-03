import DirectoryClient from '@/components/DirectoryClient';
import { getAllEntries, getDomains, getRegions } from '@/lib/data';

export default function DirectoryPage() {
  return (
    <DirectoryClient entries={getAllEntries()} domains={getDomains()} regions={getRegions()} />
  );
}
