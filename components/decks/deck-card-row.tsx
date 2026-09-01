"use client";

import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";

import { useDecks } from "@/components/deck-provider";
import {
  MAX_CARD_QUANTITY,
  formatDeckZone,
  isDeckZone,
} from "@/lib/deck-operations";
import {
  DECK_ZONES,
  type DeckEntry,
} from "@/types/deck";

type DeckCardRowProps = {
  deckId: string;
  entry: DeckEntry;
  onFeedback: (
    message: string,
    kind?: "success" | "error",
  ) => void;
};

export function DeckCardRow({
  deckId,
  entry,
  onFeedback,
}: DeckCardRowProps) {
  const {
    moveCard,
    removeCard,
    setCardQuantity,
  } = useDecks();

  const { card, quantity, zone } = entry;

  function changeQuantity(nextQuantity: number) {
    const wasUpdated = setCardQuantity(
      deckId,
      card.oracleId,
      zone,
      nextQuantity,
    );

    if (!wasUpdated) {
      onFeedback(
        `The quantity for ${card.name} could not be changed.`,
        "error",
      );
    }
  }

  function handleZoneChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const nextZone = event.currentTarget.value;

    if (!isDeckZone(nextZone)) {
      onFeedback("Choose a valid deck section.", "error");
      return;
    }

    const wasMoved = moveCard(
      deckId,
      card.oracleId,
      zone,
      nextZone,
    );

    onFeedback(
      wasMoved
        ? `Moved ${card.name} to ${formatDeckZone(nextZone)}.`
        : `${card.name} could not be moved.`,
      wasMoved ? "success" : "error",
    );
  }

  function handleRemove() {
    const wasRemoved = removeCard(
      deckId,
      card.oracleId,
      zone,
    );

    onFeedback(
      wasRemoved
        ? `Removed ${card.name}.`
        : `${card.name} could not be removed.`,
      wasRemoved ? "success" : "error",
    );
  }

  return (
    <li className="grid gap-4 border-b border-ink/10 py-4 last:border-b-0 sm:grid-cols-[64px_1fr_auto] sm:items-center">
      <Link
        href={`/cards/${card.id}`}
        className="hidden overflow-hidden rounded sm:block"
        aria-label={`View details for ${card.name}`}
      >
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt=""
            width={64}
            height={89}
            sizes="64px"
            unoptimized
            className="h-auto w-full"
          />
        ) : (
          <span className="grid aspect-[64/89] place-items-center bg-parchment text-xs text-ink/65">
            No image
          </span>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          href={`/cards/${card.id}`}
          className="font-display text-xl font-bold transition hover:text-orange"
        >
          {card.name}
        </Link>

        <p className="mt-1 text-sm text-ink/60">
          {card.typeLine}
        </p>

        {card.manaCost && (
          <p className="mt-1 text-xs text-ink/50">
            {card.manaCost}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div
          className="flex items-center border border-ink/20 bg-paper"
          aria-label={`${card.name} quantity`}
        >
          <button
            type="button"
            onClick={() => changeQuantity(quantity - 1)}
            disabled={quantity <= 1}
            className="grid h-10 w-10 place-items-center text-lg font-bold transition hover:bg-parchment disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Decrease ${card.name} quantity`}
          >
            −
          </button>

          <span
            className="min-w-10 text-center text-sm font-bold"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => changeQuantity(quantity + 1)}
            disabled={quantity >= MAX_CARD_QUANTITY}
            className="grid h-10 w-10 place-items-center text-lg font-bold transition hover:bg-parchment disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Increase ${card.name} quantity`}
          >
            +
          </button>
        </div>

        <label>
          <span className="sr-only">
            Move {card.name} to another section
          </span>

          <select
            value={zone}
            onChange={handleZoneChange}
            className="h-10 border border-ink/20 bg-paper px-3 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          >
            {DECK_ZONES.map((candidateZone) => (
              <option
                key={candidateZone}
                value={candidateZone}
              >
                {formatDeckZone(candidateZone)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleRemove}
          className="h-10 px-3 text-sm font-bold text-orange transition hover:bg-orange/10"
          aria-label={`Remove ${card.name} from the deck`}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
