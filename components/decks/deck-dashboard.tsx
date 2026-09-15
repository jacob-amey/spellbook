"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { useDecks } from "@/components/deck-provider";
import { DeckImportControl } from "@/components/decks/deck-import-control";
import {
  formatDeckFormat,
  isDeckFormat,
} from "@/lib/deck-operations";
import { DECK_FORMATS } from "@/types/deck";
import { createSampleDeck } from "@/lib/sample-deck";

type Feedback = {
  kind: "success" | "error";
  message: string;
};

function countDeckCards(
  cards: {
    quantity: number;
  }[],
): number {
  return cards.reduce(
    (total, entry) => total + entry.quantity,
    0,
  );
}

function formatUpdatedDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function DeckDashboard() {
  const router = useRouter();
  const {
    decks,
    storageError,
    isReady,
    createDeck,
    importDeck,
    deleteDeck,
  } = useDecks();

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [pendingDeleteId, setPendingDeleteId] =
    useState<string | null>(null);

  const sortedDecks = [...decks].sort((first, second) =>
    second.updatedAt.localeCompare(first.updatedAt),
  );

  function handleSampleDeck() {
    const deckId = importDeck(createSampleDeck());
    if (deckId) {
      router.push(`/decks/${deckId}`);
    } else {
      setFeedback({ kind: "error", message: "The sample deck could not be saved. Check the storage notice and try again." });
    }
  }

  function handleCreateDeck(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const submittedName = formData.get("name");
    const submittedFormat = formData.get("format");

    if (
      typeof submittedName !== "string" ||
      !submittedName.trim()
    ) {
      setFeedback({
        kind: "error",
        message: "Enter a name for your deck.",
      });

      return;
    }

    if (!isDeckFormat(submittedFormat)) {
      setFeedback({
        kind: "error",
        message: "Choose a valid deck format.",
      });

      return;
    }

    const trimmedName = submittedName.trim();

    const deckId = createDeck(
      trimmedName,
      submittedFormat,
    );

    if (!deckId) {
      setFeedback({
        kind: "error",
        message:
          "The deck could not be saved in this browser.",
      });

      return;
    }

    form.reset();
    setPendingDeleteId(null);

    setFeedback({
      kind: "success",
      message: `Created “${trimmedName}”.`,
    });
    router.push(`/decks/${deckId}`);
  }

  function handleDeleteDeck(
    deckId: string,
    deckName: string,
  ) {
    const wasDeleted = deleteDeck(deckId);

    setPendingDeleteId(null);

    if (!wasDeleted) {
      setFeedback({
        kind: "error",
        message: `“${deckName}” could not be deleted.`,
      });

      return;
    }

    setFeedback({
      kind: "success",
      message: `Deleted “${deckName}”.`,
    });
  }

  return (
    <section className="mt-10 border border-ink/10 bg-parchment/90 p-6 rounded-xl shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-ink/15 pb-5 sm:flex-row sm:items-start">
        <h2 className="text-xl font-semibold tracking-tight">
          Your decks
        </h2>

        <div className="flex flex-wrap items-start gap-4 sm:justify-end">
          <DeckImportControl />

          <span className="pt-2 text-sm text-ink/55">
            {isReady
              ? `${decks.length} ${
                  decks.length === 1 ? "deck" : "decks"
                }`
              : "Loading…"}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleCreateDeck}
        className="mt-6"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div>
            <label
              htmlFor="deck-name"
              className="block text-sm font-bold"
            >
              Deck name
            </label>

            <input
              id="deck-name"
              name="name"
              type="text"
              required
              maxLength={60}
              autoComplete="off"
              placeholder="Izzet Spells"
              className="mt-2 w-full border border-ink/20 bg-paper px-4 py-3 text-sm transition focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </div>

          <div>
            <label
              htmlFor="deck-format"
              className="block text-sm font-bold"
            >
              Format
            </label>

            <select
              id="deck-format"
              name="format"
              defaultValue="commander"
              className="mt-2 w-full border border-ink/20 bg-paper px-4 py-3 text-sm transition focus:border-moss focus:ring-2 focus:ring-moss/20"
            >
              {DECK_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {formatDeckFormat(format)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isReady}
            className="bg-forest px-5 py-3 text-sm font-bold text-cream transition hover:bg-fern disabled:cursor-wait disabled:opacity-50"
          >
            Create deck
          </button>
        </div>
      </form>

      {feedback && (
        <p
          role={
            feedback.kind === "error"
              ? "alert"
              : "status"
          }
          className={`mt-4 text-sm ${
            feedback.kind === "error"
              ? "text-orange"
              : "text-moss"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {!isReady ? (
        <div
          className="py-16 text-center text-sm text-ink/55"
          role="status"
        >
          Loading saved decks…
        </div>
      ) : sortedDecks.length === 0 ? (
        <div className="py-16 text-center">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest text-base font-semibold text-cream"
            aria-hidden="true"
          >
            +
          </span>

          <h3 className="mt-5 text-lg font-semibold tracking-tight">
            {storageError ? "Saved decks are unavailable" : "No decks yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
            {storageError ? "See the storage notice above before making changes." : "Use the form above to create your first deck. It will be saved automatically in this browser."}
          </p>
          {!storageError && (
            <div className="mt-6">
              <button type="button" onClick={handleSampleDeck} className="min-h-11 border border-orange/40 bg-orange/10 px-5 py-3 text-sm font-bold text-orange transition hover:bg-orange hover:text-night">
                Try a sample deck
              </button>
              <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-ink/65">
                Open a casual red-blue starter with creatures, spells, and lands.
                Edit your own copy and explore its mana curve. No account needed.
              </p>
            </div>
          )}
        </div>
      ) : (
        <ul className="mt-7 divide-y divide-ink/10 border-t border-ink/10">
          {sortedDecks.map((deck) => {
            const cardCount = countDeckCards(deck.cards);
            const isConfirmingDelete =
              pendingDeleteId === deck.id;

            return (
              <li
                key={deck.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    <Link
                      href={`/decks/${deck.id}`}
                      className="transition hover:text-moss"
                    >
                      {deck.name}
                    </Link>
                  </h3>

                  <p className="mt-1 text-sm text-ink/60">
                    {formatDeckFormat(deck.format)}
                    {" · "}
                    {cardCount}{" "}
                    {cardCount === 1 ? "card" : "cards"}
                    {" · "}
                    Updated{" "}
                    <time dateTime={deck.updatedAt}>
                      {formatUpdatedDate(deck.updatedAt)}
                    </time>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!isConfirmingDelete && (
                    <Link
                      href={`/decks/${deck.id}`}
                      className="bg-forest px-4 py-2 text-sm font-bold text-cream transition hover:bg-fern"
                    >
                      Open builder
                    </Link>
                  )}

                  {isConfirmingDelete ? (
                    <div
                      className="flex flex-wrap items-center gap-2"
                      aria-label={`Confirm deletion of ${deck.name}`}
                    >
                      <span className="mr-1 text-xs font-bold text-orange">
                        Delete this deck?
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingDeleteId(null)
                        }
                        className="border border-ink/20 px-3 py-2 text-xs font-bold transition hover:border-ink"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteDeck(
                            deck.id,
                            deck.name,
                          )
                        }
                        className="bg-orange px-3 py-2 text-xs font-bold text-night transition hover:brightness-110"
                      >
                        Confirm delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingDeleteId(deck.id);
                        setFeedback(null);
                      }}
                      aria-label={`Delete ${deck.name}`}
                      className="text-sm font-bold text-orange transition hover:text-ink"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
