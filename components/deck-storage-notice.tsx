"use client";

import { useState } from "react";
import { useDecks } from "@/components/deck-provider";
import { DECK_STORAGE_KEY } from "@/lib/deck-storage";
import { downloadFile } from "@/lib/download-file";

export function DeckStorageNotice() {
  const { storageError } = useDecks();
  const [backupError, setBackupError] = useState<string | null>(null);
  if (!storageError) return null;

  function downloadOriginal() {
    try {
      const source = window.localStorage.getItem(DECK_STORAGE_KEY);
      if (source === null) throw new Error("No saved collection is available to download.");
      downloadFile(source, "spellbook-recovery.txt", "text/plain");
      setBackupError(null);
    } catch {
      setBackupError("The original data is unavailable. Export any readable decks individually and keep this tab open.");
    }
  }

  return (
    <aside className="border-b border-orange/40 bg-parchment px-6 py-4 text-sm text-ink" aria-label="Deck storage status">
      <div className="mx-auto max-w-7xl">
        <p role="alert"><strong>Deck storage needs attention.</strong> {storageError}</p>
        <button type="button" onClick={downloadOriginal} className="mt-3 min-h-11 border border-orange/40 px-4 py-2 font-bold text-orange">
          Download original data
        </button>
        <p className="mt-2 text-xs text-ink/70">Keep this recovery file before repairing browser data. Individual deck JSON exports can be imported into Spellbook.</p>
        {backupError && <p className="mt-2 text-orange" role="alert">{backupError}</p>}
      </div>
    </aside>
  );
}
