"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChangeEvent } from "react";

import { useDecks } from "@/components/deck-provider";
import {
  MAX_DECK_IMPORT_SIZE,
  parseDeckImport,
} from "@/lib/deck-serialization";

type ImportFeedback = {
  kind: "success" | "error";
  message: string;
};

export function DeckImportControl() {
  const { importDeck, isReady } = useDecks();
  const [feedback, setFeedback] =
    useState<ImportFeedback | null>(null);
  const [importedDeckId, setImportedDeckId] =
    useState<string | null>(null);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    setImportedDeckId(null);

    if (!file) {
      return;
    }

    if (file.size > MAX_DECK_IMPORT_SIZE) {
      setFeedback({
        kind: "error",
        message: "That deck file is larger than 2 MB.",
      });
      input.value = "";
      return;
    }

    try {
      const result = parseDeckImport(await file.text());

      if (!result.ok) {
        setFeedback({
          kind: "error",
          message: result.error,
        });
        return;
      }

      const deckId = importDeck(result.deck);

      if (!deckId) {
        setFeedback({
          kind: "error",
          message:
            "The imported deck could not be saved in this browser.",
        });
        return;
      }

      setImportedDeckId(deckId);
      setFeedback({
        kind: "success",
        message: `Imported “${result.deck.name}”.`,
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "The selected deck file could not be read.",
      });
    } finally {
      input.value = "";
    }
  }

  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center border border-ink/20 px-4 py-2 text-sm font-bold transition hover:border-orange hover:text-orange ${
          !isReady ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Import JSON
        <input
          type="file"
          accept="application/json,.json"
          disabled={!isReady}
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {feedback && (
        <p
          className={`mt-2 text-xs ${
            feedback.kind === "error"
              ? "text-orange"
              : "text-moss"
          }`}
          role={
            feedback.kind === "error" ? "alert" : "status"
          }
        >
          {feedback.message}{" "}
          {importedDeckId && (
            <Link
              href={`/decks/${importedDeckId}`}
              className="font-bold underline underline-offset-2"
            >
              Open it
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
