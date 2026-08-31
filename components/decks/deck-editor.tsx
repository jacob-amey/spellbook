"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import { useDecks } from "@/components/deck-provider";
import { DeckExportControls } from "@/components/decks/deck-export-controls";
import { DeckStatistics } from "@/components/decks/deck-statistics";
import { DeckValidation } from "@/components/decks/deck-validation";
import { DeckZoneSection } from "@/components/decks/deck-zone-section";
import { analyzeDeck } from "@/lib/deck-analysis";
import {
  formatDeckFormat,
  isDeckFormat,
} from "@/lib/deck-operations";
import {
  DECK_FORMATS,
  type DeckZone,
} from "@/types/deck";

type DeckEditorProps = {
  deckId: string;
};

type Feedback = {
  kind: "success" | "error";
  message: string;
};

export function DeckEditor({ deckId }: DeckEditorProps) {
  const router = useRouter();
  const {
    decks,
    deleteDeck,
    isReady,
    renameDeck,
    setDeckFormat,
  } = useDecks();
  const [feedback, setFeedback] =
    useState<Feedback | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] =
    useState(false);

  const deck = decks.find(
    (candidate) => candidate.id === deckId,
  );
  const analysis = deck ? analyzeDeck(deck) : null;

  function showFeedback(
    message: string,
    kind: "success" | "error" = "success",
  ) {
    setFeedback({ kind, message });
  }

  function handleRename(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!deck) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const value = formData.get("name");

    if (typeof value !== "string" || !value.trim()) {
      showFeedback("Enter a name for this deck.", "error");
      return;
    }

    const trimmedName = value.trim();

    if (trimmedName === deck.name) {
      showFeedback("The deck name is already up to date.");
      return;
    }

    const wasRenamed = renameDeck(deck.id, trimmedName);

    showFeedback(
      wasRenamed
        ? `Renamed the deck to “${trimmedName}”.`
        : "The deck name could not be saved.",
      wasRenamed ? "success" : "error",
    );
  }

  function handleFormatChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    if (!deck) {
      return;
    }

    const format = event.currentTarget.value;

    if (!isDeckFormat(format)) {
      showFeedback("Choose a valid deck format.", "error");
      return;
    }

    const wasUpdated = setDeckFormat(deck.id, format);

    showFeedback(
      wasUpdated
        ? `Changed the format to ${formatDeckFormat(format)}.`
        : "The deck format could not be changed.",
      wasUpdated ? "success" : "error",
    );
  }

  function handleDeleteDeck() {
    if (!deck) {
      return;
    }

    if (deleteDeck(deck.id)) {
      router.replace("/decks");
      return;
    }

    setIsConfirmingDelete(false);
    showFeedback("The deck could not be deleted.", "error");
  }

  if (!isReady) {
    return (
      <main
        id="main-content"
        className="min-h-[calc(100vh-76px)] bg-paper px-6 py-16 text-ink lg:px-[7vw]"
      >
        <div
          className="mx-auto max-w-7xl animate-pulse"
          aria-busy="true"
          aria-label="Loading deck"
        >
          <div className="h-4 w-32 bg-ink/10" />
          <div className="mt-8 h-14 max-w-xl bg-ink/10" />
          <div className="mt-10 h-64 bg-parchment" />
        </div>
      </main>
    );
  }

  if (!deck || !analysis) {
    return (
      <main
        id="main-content"
        className="grid min-h-[calc(100vh-76px)] place-items-center bg-paper px-6 py-20 text-ink"
      >
        <div className="max-w-xl text-center">
          <p className="text-5xl" aria-hidden="true">
            ◇
          </p>
          <h1 className="mt-5 font-display text-5xl">
            Deck not found
          </h1>
          <p className="mt-4 leading-7 text-ink/60">
            This deck may have been deleted, imported under a new
            address, or saved in another browser.
          </p>
          <Link
            href="/decks"
            className="mt-7 inline-block bg-forest px-5 py-3 text-sm font-bold text-cream transition hover:bg-fern"
          >
            Return to your decks
          </Link>
        </div>
      </main>
    );
  }

  const zoneOrder: DeckZone[] =
    deck.format === "commander"
      ? ["commander", "mainboard", "sideboard"]
      : ["mainboard", "sideboard", "commander"];

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-76px)] bg-parchment px-6 py-12 text-ink lg:px-[5vw] lg:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/decks"
          className="text-sm font-bold text-orange transition hover:text-ink"
        >
          ← All decks
        </Link>

        <header className="mt-7 border border-ink/15 bg-paper p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink/50">
                Deck workspace · Autosaved locally
              </p>

              <form
                key={`${deck.id}:${deck.name}`}
                onSubmit={handleRename}
                className="mt-3 flex max-w-2xl flex-col gap-3 sm:flex-row"
              >
                <label className="grow">
                  <span className="sr-only">Deck name</span>
                  <input
                    name="name"
                    type="text"
                    required
                    maxLength={60}
                    defaultValue={deck.name}
                    className="w-full border-b-2 border-ink/20 bg-transparent py-2 font-display text-4xl font-bold outline-none transition focus:border-orange sm:text-5xl"
                  />
                </label>

                <button
                  type="submit"
                  className="self-start border border-ink/20 px-4 py-2 text-sm font-bold transition hover:border-orange hover:text-orange sm:self-end"
                >
                  Save name
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-bold">
                  Format
                  <select
                    value={deck.format}
                    onChange={handleFormatChange}
                    className="border border-ink/20 bg-paper px-3 py-2 font-normal outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                  >
                    {DECK_FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {formatDeckFormat(format)}
                      </option>
                    ))}
                  </select>
                </label>

                <span className="text-sm text-ink/50">
                  {analysis.totals.all} total cards across all
                  sections
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <DeckExportControls deck={deck} />

              {isConfirmingDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-orange">
                    Permanently delete this deck?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="border border-ink/20 px-3 py-2 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDeck}
                    className="bg-orange px-3 py-2 text-xs font-bold text-night"
                  >
                    Confirm delete
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-sm font-bold text-orange transition hover:text-ink"
                >
                  Delete deck
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <p
              className={`mt-5 border-l-4 px-3 py-2 text-sm ${
                feedback.kind === "error"
                  ? "border-orange bg-orange/5"
                  : "border-forest bg-forest/5"
              }`}
              role={
                feedback.kind === "error" ? "alert" : "status"
              }
            >
              {feedback.message}
            </p>
          )}
        </header>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border border-orange/20 bg-forest p-5 text-cream">
              <div>
                <h2 className="font-display text-2xl">
                  Add cards from the archive
                </h2>
                <p className="mt-1 text-sm text-cream/70">
                  Search for any card, then choose this deck from the
                  result tile.
                </p>
              </div>

              <Link
                href="/#search"
                className="bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110"
              >
                Search cards
              </Link>
            </div>

            {zoneOrder.map((zone) => (
              <DeckZoneSection
                key={zone}
                deckId={deck.id}
                zone={zone}
                entries={deck.cards.filter(
                  (entry) => entry.zone === zone,
                )}
                onFeedback={showFeedback}
              />
            ))}
          </div>

          <aside className="space-y-6 self-start xl:sticky xl:top-6">
            <DeckStatistics analysis={analysis} />
            <DeckValidation analysis={analysis} />
          </aside>
        </div>
      </div>
    </main>
  );
}
