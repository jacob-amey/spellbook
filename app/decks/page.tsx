import type { Metadata } from "next";
import Link from "next/link";

import { DeckDashboard } from "@/components/decks/deck-dashboard";

export const metadata: Metadata = {
  title: "Deck Builder | Spellbook",
  description:
    "Create and manage Magic: The Gathering decks.",
};

const builderCapabilities = [
  "Create and manage multiple decks",
  "Add cards from search results",
  "Manage card quantities and deck zones",
  "Validate format and color-identity rules",
  "Review mana curve and type distribution",
  "Import, export, and save decks locally",
];

export default function DecksPage() {
  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-76px)] bg-paper/70 px-6 py-16 text-ink lg:px-[7vw] lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-[11px] font-extrabold tracking-[0.19em] text-orange">
          THE DECK WORKSHOP
        </p>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="font-display text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              Build with intention.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/65">
              Shape your collection into a complete
              deck, understand its mana curve, and catch
              format problems before you shuffle.
            </p>

            <DeckDashboard />
          </section>

          <aside className="self-start border border-orange/20 bg-forest/80 p-7 text-cream shadow-[14px_14px_0_rgb(230_161_95_/_0.1)] sm:p-9">
            <p className="text-[11px] font-extrabold tracking-[0.17em] text-orange">
              BUILDER SYSTEM
            </p>

            <h2 className="mt-3 font-display text-3xl">
              Built for the full process
            </h2>

            <ol className="mt-7 space-y-5">
              {builderCapabilities.map((feature, index) => (
                <li
                  key={feature}
                  className="grid grid-cols-[32px_1fr] items-start gap-3"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-orange/35 text-xs font-bold text-orange">
                    {index + 1}
                  </span>

                  <span className="pt-1 text-sm leading-6 text-cream/80">
                    {feature}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <Link
          href="/explore"
          className="mt-10 inline-block text-sm font-bold text-orange transition hover:translate-x-[-2px]"
        >
          ← Return to Explore
        </Link>
      </div>
    </main>
  );
}
