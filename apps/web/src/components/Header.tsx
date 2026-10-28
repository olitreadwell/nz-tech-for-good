'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';

import { primaryNav } from '@/lib/navigation';

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark: boolean) => {
      setDark(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    };
    applyTheme(saved === 'dark' || (!saved && media.matches));

    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) applyTheme(event.matches);
    };
    media.addEventListener('change', onSystemThemeChange);
    return () => media.removeEventListener('change', onSystemThemeChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab' || !headerRef.current) return;
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-[60] border-b border-border bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight"
          onClick={() => setOpen(false)}
        >
          NZ Tech-for-Good
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden gap-1 sm:flex">
            {primaryNav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? 'bg-brand-soft text-brand'
                    : 'text-text-muted hover:bg-surface-alt hover:text-text'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface-alt"
            aria-label="Toggle theme"
            title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            data-testid="menu-toggle"
            className="rounded-lg border border-border p-2 sm:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      <div
        className={`overflow-hidden transition-all duration-200 sm:hidden ${
          open ? 'max-h-80 border-t border-border' : 'max-h-0'
        }`}
      >
        <nav aria-label="Primary mobile" className="space-y-1 px-4 py-2">
          {primaryNav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(l.href) ? 'bg-brand-soft text-brand' : 'hover:bg-surface-alt'
              }`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
