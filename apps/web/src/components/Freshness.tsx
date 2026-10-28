'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/** Human-readable verification age that is safe to server-render and hydrate. */
export function Freshness({ date }: { date: string }) {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  if (!date) {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Not verified
      </span>
    );
  }

  if (!today) {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Verified {date}
      </span>
    );
  }

  const daysAgo = Math.max(
    0,
    Math.floor((new Date(today).getTime() - new Date(date).getTime()) / 86400000)
  );
  const label =
    daysAgo <= 7
      ? 'This week'
      : daysAgo <= 30
        ? `${daysAgo}d ago`
        : `${Math.round(daysAgo / 30)}mo ago`;

  return (
    <span className={`inline-flex items-center gap-1 ${daysAgo > 90 ? 'text-red-500' : ''}`}>
      <Clock className="h-4 w-4" />
      {label}
    </span>
  );
}
