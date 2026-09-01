"use client";

import Link from "next/link";
import { CardSearch } from "@/components/card-search";
import { useDecks } from "@/components/deck-provider";

export function SiteHeader() {
  const { decks, isReady } = useDecks();
  const deckCount = isReady ? decks.length : 0;
  return (
    <header className="sticky top-0 z-50 border-b border-orange/15 bg-paper/90 backdrop-blur-xl">
      <nav
        className="flex h-[76px] items-center px-6 lg:px-20"
        aria-label="Primary navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 font-display text-2xl font-bold"
          aria-label="Spellbook home"
        >
          <span className="grid h-9 w-9 rotate-45 place-items-center border border-orange/50 bg-forest text-lg italic text-cream shadow-[0_0_24px_rgb(230_161_95_/_0.14)] transition group-hover:border-orange">
            <span className="-rotate-45">S</span>
          </span>

          <span className="transition group-hover:text-orange">Spellbook</span>
        </Link>

        <div className="mx-8 hidden min-w-0 max-w-sm flex-1 lg:block">
          <CardSearch compact id="header-card-search" />
        </div>

        <div className="ml-auto hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.12em] text-ink/70 md:flex lg:ml-0">
          <Link href="/" className="transition-colors hover:text-orange">
            Home
          </Link>

          <Link href="/explore" className="transition-colors hover:text-orange">
            Explore
          </Link>

          <Link href="/decks" className="transition-colors hover:text-orange">
            Deck Builder
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-7">
          <Link
            href="/explore"
            className="rounded-full border border-ink/15 px-3 py-2 text-xs font-bold transition-colors hover:border-orange hover:text-orange md:hidden"
          >
            Explore
          </Link>

          <Link
            href="/decks"
            className="rounded-full border border-ink/15 bg-ink/5 px-4 py-2 text-sm font-bold transition-colors hover:border-orange hover:text-orange"
          >
            Decks
            <span className="ml-2 inline-grid h-5 min-w-5 place-items-center rounded-full bg-orange px-1 text-[11px] text-night">
              {deckCount}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
