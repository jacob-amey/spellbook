import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { DeckProvider } from "@/components/deck-provider";
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
  title: "Spellbook — MTG Card Search",
  description: "Search and explore Magic: The Gathering cards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} antialiased`}
    >
      <body className="min-h-screen">
        <DeckProvider>
          <SiteHeader />
          {children}
        </DeckProvider>
      </body>
    </html>
  );
}
