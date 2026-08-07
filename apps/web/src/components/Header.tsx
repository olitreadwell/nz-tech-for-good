import Link from "next/link";

const links = [
  { href: "/directory", label: "Browse" },
  { href: "/map", label: "Map" },
  { href: "/stats", label: "Stats" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/saved", label: "Saved" },
];

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          NZ Tech-for-Good
        </Link>
        <nav aria-label="Primary" className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-3 py-1.5 text-sm font-medium text-text-muted hover:bg-surface-alt hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
