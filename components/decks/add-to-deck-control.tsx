"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import { useDecks } from "@/components/deck-provider";
import {
  formatDeckZone,
  isDeckZone,
} from "@/lib/deck-operations";
import type { Card } from "@/types/card";
import { DECK_ZONES } from "@/types/deck";

type AddToDeckControlProps = {
  card: Card;
};

type AddFeedback = {
  kind: "success" | "error";
  message: string;
};

export function AddToDeckControl({
  card,
}: AddToDeckControlProps) {
  const { addCard, decks, isReady } = useDecks();
  const [feedback, setFeedback] =
    useState<AddFeedback | null>(null);

  const sortedDecks = [...decks].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const deckId = formData.get("deckId");
    const zone = formData.get("zone");

    if (typeof deckId !== "string" || !isDeckZone(zone)) {
      setFeedback({
        kind: "error",
        message: "Choose a valid deck and section.",
      });
      return;
    }

    const deck = decks.find(
      (candidate) => candidate.id === deckId,
    );

    if (!deck) {
      setFeedback({
        kind: "error",
        message: "That deck is no longer available.",
      });
      return;
    }

    const wasAdded = addCard(deck.id, card, zone);

    setFeedback(
      wasAdded
        ? {
            kind: "success",
            message: `Added to ${deck.name}.`,
          }
        : {
            kind: "error",
            message: "The card could not be added.",
          },
    );
  }

  if (!isReady) {
    return (
      <p className="text-xs text-ink/45" role="status">
        Loading saved decks…
      </p>
    );
  }

  if (sortedDecks.length === 0) {
    return (
      <p className="text-sm text-ink/60">
        <Link
          href="/decks"
          className="font-bold text-orange underline underline-offset-2"
        >
          Create a deck
        </Link>{" "}
        to add this card.
      </p>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-2"
      >
        <label>
          <span className="sr-only">
            Deck for {card.name}
          </span>
          <select
            key={sortedDecks[0].id}
            name="deckId"
            defaultValue={sortedDecks[0].id}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          >
            {sortedDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label>
            <span className="sr-only">
              Deck section for {card.name}
            </span>
            <select
              name="zone"
              defaultValue="mainboard"
              className="h-full w-full border border-ink/20 bg-paper px-3 py-2 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
            >
              {DECK_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {formatDeckZone(zone)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="bg-forest px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
          >
            Add
          </button>
        </div>
      </form>

      {feedback && (
        <p
          className={`mt-2 text-xs ${
            feedback.kind === "error"
              ? "text-orange"
              : "text-forest"
          }`}
          role={
            feedback.kind === "error" ? "alert" : "status"
          }
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
