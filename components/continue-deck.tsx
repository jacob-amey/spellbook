"use client";

import Link from "next/link";

import { useDecks } from "@/components/deck-provider";

export function ContinueDeck() {
  const { decks, isReady } = useDecks();

  if (!isReady) {
    return <div className="h-24 animate-pulse border border-ink/10 bg-ink/5" />;
  }

  const recentDeck = [...decks].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  )[0];

  if (!recentDeck) {
    return (
      <Link
        href="/decks"
        className="group flex min-h-24 items-center justify-between gap-5 border border-ink/10 bg-paper/50 p-5 transition hover:border-orange/40"
      >
        <span>
          <span className="block text-xs font-extrabold uppercase tracking-[0.14em] text-orange">
            Start building
          </span>
          <span className="mt-2 block font-display text-xl">
            Create your first deck
          </span>
        </span>
        <span className="text-2xl text-orange transition group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }

  const cardCount = recentDeck.cards.reduce(
    (total, entry) => total + entry.quantity,
    0,
  );

  return (
    <Link
      href={`/decks/${recentDeck.id}`}
      className="group flex min-h-24 items-center justify-between gap-5 border border-moss/20 bg-moss/5 p-5 transition hover:border-orange/45"
    >
      <span className="min-w-0">
        <span className="block text-xs font-extrabold uppercase tracking-[0.14em] text-orange">
          Continue your latest deck
        </span>
        <span className="mt-2 block truncate font-display text-xl">
          {recentDeck.name}
        </span>
        <span className="mt-1 block text-xs text-ink/65">
          {recentDeck.format} · {cardCount} card{cardCount === 1 ? "" : "s"}
        </span>
      </span>
      <span className="text-2xl text-orange transition group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
