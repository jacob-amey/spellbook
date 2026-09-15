import { readStoredDecks, serializeStoredDecks } from "@/lib/deck-serialization";
import type { Deck } from "@/types/deck";

export const DECK_STORAGE_KEY = "spellbook.decks";
export type DeckStorageSnapshot = {
  decks: Deck[];
  source: string | null;
  error: string | null;
};
export const EMPTY_DECK_SNAPSHOT: DeckStorageSnapshot = {
  decks: [], source: null, error: null,
};

type StorageAccess = Pick<Storage, "getItem" | "setItem">;

// Inject access so blocked storage, quota failures, and stale writes are testable.
export function createDeckStorage(getStorage: () => StorageAccess) {
  let snapshot = EMPTY_DECK_SNAPSHOT;
  let hasRead = false;
  let readFailed = false;
  let isReadable = false;

  function read(): DeckStorageSnapshot {
    try {
      const source = getStorage().getItem(DECK_STORAGE_KEY);
      if (!hasRead || readFailed || source !== snapshot.source) {
        snapshot = { source, ...readStoredDecks(source) };
        isReadable = snapshot.error === null;
        hasRead = true;
        readFailed = false;
      }
    } catch {
      if (!readFailed) {
        snapshot = {
          ...snapshot,
          error: "Browser storage is unavailable. Allow site storage and try again. Previously loaded decks can still be exported.",
        };
        readFailed = true;
      }
    }
    return snapshot;
  }

  function write(decks: Deck[], expected: DeckStorageSnapshot): boolean {
    const current = read();
    // Never replace unreadable data or a collection changed since the edit began.
    if (readFailed || !isReadable) return false;
    if (current.source !== expected.source) {
      snapshot = { ...current, error: "The collection changed in another tab. Review the latest decks and try your edit again." };
      return false;
    }
    try {
      const source = serializeStoredDecks(decks);
      getStorage().setItem(DECK_STORAGE_KEY, source);
      snapshot = { decks, source, error: null };
      return true;
    } catch {
      snapshot = {
        ...current,
        error: "The latest change was not saved. Browser storage may be full or blocked. Export a backup before freeing space, then try again.",
      };
      return false;
    }
  }

  return { read, write };
}
