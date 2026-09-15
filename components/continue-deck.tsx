"use client";

import Link from "next/link";

import { useDecks } from "@/components/deck-provider";
import { Icon } from "@/components/ui/icon";

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
        className="group flex min-h-16 items-center gap-3 rounded-lg py-2 transition-colors hover:text-moss"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink/10 bg-parchment text-moss"><Icon name="cards" className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">
            Your decks
          </span>
          <span className="mt-1 block text-xs text-ink/60">
            Create a list or open the sample deck
          </span>
        </span>
        <Icon name="arrow-right" className="h-4 w-4 text-ink/60 transition-colors group-hover:text-moss" />
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
      className="group flex min-h-20 items-center justify-between gap-4 rounded-lg border border-ink/10 bg-parchment/50 px-4 py-3 transition-colors hover:border-moss/40"
    >
      <span className="min-w-0">
        <span className="block text-xs text-ink/60">
          Recently edited
        </span>
        <span className="mt-1 block truncate text-sm font-medium">
          {recentDeck.name}
        </span>
        <span className="mt-1 block text-xs text-ink/65">
          {recentDeck.format} · {cardCount} card{cardCount === 1 ? "" : "s"}
        </span>
      </span>
      <Icon name="arrow-right" className="h-4 w-4 text-moss" />
    </Link>
  );
}
