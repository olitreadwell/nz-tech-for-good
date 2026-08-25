import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold">NZ Tech-for-Good</h4>
            <p className="mt-1 text-xs text-text-muted">
              Community-maintained directory of Aotearoa organisations using
              technology for public good.{" "}
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
          <div>
            <h4 className="text-sm font-semibold">Browse</h4>
            <ul className="mt-1 space-y-1 text-xs">
              <li>
                <Link
                  href="/directory"
                  className="text-text-muted hover:text-text"
                >
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-text-muted hover:text-text">
                  Map
                </Link>
              </li>
              <li>
                <Link
                  href="/domains"
                  className="text-text-muted hover:text-text"
                >
                  Domains
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-text-muted hover:text-text">
                  Stats
                </Link>
              </li>
              <li>
                <Link
                  href="/regions"
                  className="text-text-muted hover:text-text"
                >
                  Regions
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-text-muted hover:text-text">
                  Tags
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-text-muted hover:text-text">
                  Saved
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Info</h4>
            <ul className="mt-1 space-y-1 text-xs">
              <li>
                <Link
                  href="/get-involved"
                  className="text-text-muted hover:text-text"
                >
                  Get Involved
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-muted hover:text-text"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-text-muted hover:text-text">
                  Saved
                </Link>
              </li>
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
            </ul>
          </div>
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
          Updated: {new Date().toISOString().slice(0, 10)} · Aotearoa New
          Zealand
        </p>
      </div>
    </footer>
  );
}
