"use client";

import {
  createDeckFileName,
  serializeDeckExport,
  serializeDeckText,
} from "@/lib/deck-serialization";
import type { Deck } from "@/types/deck";

type DeckExportControlsProps = {
  deck: Deck;
};

function downloadFile(
  contents: string,
  fileName: string,
  type: string,
) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function DeckExportControls({
  deck,
}: DeckExportControlsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label="Export deck"
    >
      <button
        type="button"
        onClick={() =>
          downloadFile(
            serializeDeckExport(deck),
            createDeckFileName(deck.name, "json"),
            "application/json",
          )
        }
        className="border border-ink/20 px-4 py-2 text-sm font-bold transition hover:border-orange hover:text-orange"
      >
        Export JSON
      </button>

      <button
        type="button"
        onClick={() =>
          downloadFile(
            serializeDeckText(deck),
            createDeckFileName(deck.name, "txt"),
            "text/plain",
          )
        }
        className="border border-ink/20 px-4 py-2 text-sm font-bold transition hover:border-orange hover:text-orange"
      >
        Export text
      </button>
    </div>
  );
}
