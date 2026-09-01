import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { DeckProvider } from "@/components/deck-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spellbook — MTG Card Search & Deck Builder",
  description:
    "Discover Magic: The Gathering cards, explore the Scryfall archive with powerful filters, and build decks locally.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} antialiased`}
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
          className="fixed left-4 top-3 z-[100] -translate-y-20 bg-orange px-4 py-3 text-sm font-bold text-night transition focus:translate-y-0"
        >
          Skip to main content
        </a>

        <DeckProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </DeckProvider>
      </body>
    </html>
  );
}
