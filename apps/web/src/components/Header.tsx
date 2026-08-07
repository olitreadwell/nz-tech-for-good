"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/directory", label: "Browse" },
  { href: "/map", label: "Map" },
  { href: "/stats", label: "Stats" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/saved", label: "Saved" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          NZ Tech-for-Good
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden gap-1 sm:flex">
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

        {/* Mobile toggle */}
        <button
          type="button"
          className="sm:hidden rounded border border-border p-1.5"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          aria-label="Primary mobile"
          className="border-t border-border px-4 pb-3 sm:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-alt hover:text-text"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
