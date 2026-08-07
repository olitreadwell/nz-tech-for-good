import Link from "next/link";
import {
  Globe,
  GitBranch,
  Briefcase,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

interface EntryCardProps {
  slug: string;
  name: string;
  domain: string;
  domainLabel: string;
  what: string;
  region: string;
  tags: string[];
  founding_year: number | null;
  takes_contributors: boolean | null;
  website: string;
  github: string;
  linkedin_org: string;
  community_url: string;
  events_url: string;
  last_verified: string;
}

function Freshness({ date }: { date: string }) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86400000,
  );
  const label =
    daysAgo <= 7
      ? "This week"
      : daysAgo <= 30
        ? `${daysAgo}d ago`
        : `${Math.round(daysAgo / 30)}mo ago`;

  return (
    <span
      className={`inline-flex items-center gap-1 ${daysAgo > 90 ? "text-red-500" : ""}`}
    >
      <Clock className="h-4 w-4" />
      {label}
    </span>
  );
}

function MetaIcon({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span title={label} className="inline-flex items-center">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function EntryCard({
  slug,
  name,
  domainLabel,
  what,
  region,
  tags,
  founding_year,
  takes_contributors,
  website,
  github,
  linkedin_org,
  community_url,
  events_url,
  last_verified,
}: EntryCardProps) {
  return (
    <li className="rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center gap-2">
        <Link
          href={`/domains/${domainLabel.toLowerCase().replace(/\s+/g, "-")}`}
          className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"
        >
          {domainLabel}
        </Link>
        {takes_contributors && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            <Users className="h-3 w-3" />
            Contributors
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold">
        <Link href={`/entry/${slug}`} className="hover:text-brand">
          {name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-text-muted line-clamp-2">{what}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        <Link href={`/regions/${region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="inline-flex items-center gap-1 hover:text-brand">
          <MapPin className="h-3.5 w-3.5" />
          {region}
        </Link>
        {founding_year && <span>Est. {founding_year}</span>}
        {github && <MetaIcon icon={GitBranch} label="Has GitHub" />}
        {linkedin_org && <MetaIcon icon={Briefcase} label="Has LinkedIn" />}
        {community_url && (
          <MetaIcon icon={MessageCircle} label="Has community" />
        )}
        {events_url && <MetaIcon icon={Calendar} label="Has events" />}
        <Freshness date={last_verified} />
      </p>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.slice(0, 5).map((t) => (
            <Link
              key={t}
              href={`/directory?q=${encodeURIComponent(t)}`}
              className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-text-muted hover:bg-brand-soft hover:text-brand"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </a>
        )}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            <GitBranch className="h-3.5 w-3.5" />
            GitHub
          </a>
        )}
        {linkedin_org && (
          <a
            href={linkedin_org}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            <Briefcase className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
      </div>
    </li>
  );
}
