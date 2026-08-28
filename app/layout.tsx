import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

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
      className={`${sans.variable} ${display.variable} antialiased`}
    >
      <body className="min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
