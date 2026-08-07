import "../../../../packages/ui/src/styles/globals.css";
import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s · NZ Tech-for-Good",
    default: "NZ Tech-for-Good",
  },
  description:
    "A directory of Aotearoa New Zealand organisations using technology for public good.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NZ">
      <body className="min-h-screen antialiased flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
