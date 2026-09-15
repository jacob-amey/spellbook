import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { DeckProvider } from "@/components/deck-provider";
import { DeckStorageNotice } from "@/components/deck-storage-notice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.origin ?? "http://localhost:3000"),
  applicationName: "Spellbook",
  robots: { index: site.indexable, follow: true },
  title: "Spellbook — MTG Card Search & Deck Builder",
  description:
    "Search Magic: The Gathering cards, compare printings and rulings, and build decks with browser-local storage and JSON backups.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://api.scryfall.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cards.scryfall.io"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-night transition focus:translate-y-0"
        >
          Skip to main content
        </a>

        <DeckProvider>
          <SiteHeader />
          <DeckStorageNotice />
          {children}
          <SiteFooter />
        </DeckProvider>
      </body>
    </html>
  );
}
