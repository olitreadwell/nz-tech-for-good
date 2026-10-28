import Link from 'next/link';

import { footerNav } from '@/lib/navigation';

export function Footer({ latestVerified }: { latestVerified?: string }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold">NZ Tech-for-Good</h4>
            <p className="mt-1 text-xs text-text-muted">
              Community-maintained directory of Aotearoa organisations using technology for public
              good.{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY-SA 4.0
              </a>
              .
            </p>
          </div>
          {footerNav.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold">{group.title}</h4>
              <ul className="mt-1 space-y-1 text-xs">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <Link href={link.href} className="text-text-muted hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {group.title === 'Info' && (
                  <>
                    <li>
                      <a
                        href="https://github.com/olitreadwell/nz-tech-for-good"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text"
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/olitreadwell/nz-tech-for-good/blob/main/CONTRIBUTING.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-text"
                      >
                        Contribute
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold">Data</h4>
            <ul className="mt-1 space-y-1 text-xs">
              <li>
                <a
                  href="https://raw.githubusercontent.com/olitreadwell/nz-tech-for-good/main/data/exports/entries.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text"
                >
                  JSON Export
                </a>
              </li>
              <li>
                <a
                  href="https://raw.githubusercontent.com/olitreadwell/nz-tech-for-good/main/data/exports/entries.csv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text"
                >
                  CSV Export
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">
          Latest entry verification: {latestVerified || 'not recorded'} · Aotearoa New Zealand
        </p>
      </div>
    </footer>
  );
}
