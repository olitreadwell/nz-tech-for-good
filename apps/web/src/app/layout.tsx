import "../../../../packages/ui/src/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · NZ Tech-for-Good",
    default: "NZ Tech-for-Good",
  },
  description:
    "A directory of Aotearoa New Zealand organisations using technology for public good.",
  icons: { icon: "/nz-tech-for-good/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NZ">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
