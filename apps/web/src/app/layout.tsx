import '../../../../packages/ui/src/styles/globals.css';
import '@/styles/print.css';
import type { Metadata, Viewport } from 'next';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { getLatestVerified } from '@/lib/data';
import { getSiteOrigin, getSiteUrl, withBasePath } from '@/lib/site';

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('theme');
      var dark = saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
    } catch (error) {
      document.documentElement.classList.add('light');
    }
  })();
`;

export const metadata: Metadata = {
  title: {
    template: '%s · NZ Tech-for-Good',
    default: 'NZ Tech-for-Good',
  },
  description:
    'A directory of Aotearoa New Zealand organisations using technology for public good.',
  metadataBase: new URL(getSiteOrigin()),
  icons: {
    icon: [
      { url: getSiteUrl('/favicon.svg'), type: 'image/svg+xml' },
      { url: getSiteUrl('/favicon-32x32.png'), sizes: '32x32', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'NZ Tech-for-Good',
    description:
      'A directory of Aotearoa New Zealand organisations using technology for public good.',
    images: [
      { url: getSiteUrl('/og-image.png'), width: 1200, height: 630, alt: 'NZ Tech-for-Good' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NZ Tech-for-Good',
    description:
      'A directory of Aotearoa New Zealand organisations using technology for public good.',
    images: [getSiteUrl('/og-image.png')],
  },
  alternates: { types: { 'application/rss+xml': getSiteUrl('/feed.xml') } },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; base-uri 'self'; connect-src 'self' https://unpkg.com; form-action 'self'; img-src 'self' data: https://*.tile.openstreetmap.org; font-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; frame-ancestors 'none'"
        />
        <link rel="prefetch" href={withBasePath('/directory')} />
        <link rel="prefetch" href={withBasePath('/map')} />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <div
          id="scroll-progress"
          className="fixed top-0 left-0 z-40 h-0.5 bg-brand transition-all"
          style={{ width: '0%' }}
        />
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <Footer latestVerified={getLatestVerified()} />
        <BackToTop />
      </body>
    </html>
  );
}
