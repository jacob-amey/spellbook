"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
  addCardToDeckRecord,
  isDeckFormat,
  moveDeckEntry,
  removeDeckEntry,
  renameDeckRecord,
  setDeckEntryQuantity,
  setDeckFormatRecord,
} from "@/lib/deck-operations";
import {
  parseDeckValue,
} from "@/lib/deck-serialization";
import type { Card } from "@/types/card";
import type {
  Deck,
  DeckFormat,
  DeckZone,
} from "@/types/deck";

import {
  createDeckStorage,
  DECK_STORAGE_KEY as STORAGE_KEY,
  EMPTY_DECK_SNAPSHOT,
  type DeckStorageSnapshot,
} from "@/lib/deck-storage";

const deckStorage = createDeckStorage(() => window.localStorage);
const DECKS_CHANGED_EVENT = "spellbook:decks-changed";

type DeckContextValue = {
  decks: Deck[];
  isReady: boolean;
  storageError: string | null;
  createDeck: (
    name: string,
    format: DeckFormat,
  ) => string | null;
  deleteDeck: (deckId: string) => boolean;
  renameDeck: (deckId: string, name: string) => boolean;
  setDeckFormat: (
    deckId: string,
    format: DeckFormat,
  ) => boolean;
  addCard: (
    deckId: string,
    card: Card,
    zone?: DeckZone,
  ) => boolean;
  setCardQuantity: (
    deckId: string,
    oracleId: string,
    zone: DeckZone,
    quantity: number,
  ) => boolean;
  moveCard: (
    deckId: string,
    oracleId: string,
    fromZone: DeckZone,
    toZone: DeckZone,
  ) => boolean;
  removeCard: (
    deckId: string,
    oracleId: string,
    zone: DeckZone,
  ) => boolean;
  importDeck: (deck: Deck) => string | null;
};

type DeckProviderProps = {
  children: ReactNode;
};

type StoreListener = () => void;

const DeckContext = createContext<DeckContextValue | null>(null);

function getDeckSnapshot(): DeckStorageSnapshot {
  return deckStorage.read();
}

function getServerDeckSnapshot(): DeckStorageSnapshot {
  return EMPTY_DECK_SNAPSHOT;
}

function subscribeToDecks(
  listener: StoreListener,
): () => void {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === STORAGE_KEY ||
      event.key === null
    ) {
      listener();
    }
  }

  function handleDeckChange() {
    listener();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    DECKS_CHANGED_EVENT,
    handleDeckChange,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      DECKS_CHANGED_EVENT,
      handleDeckChange,
    );
  };
}

function saveDecks(decks: Deck[], expected: DeckStorageSnapshot): boolean {
  const wasSaved = deckStorage.write(decks, expected);
  window.dispatchEvent(new Event(DECKS_CHANGED_EVENT));
  return wasSaved;
}

function updateStoredDeck(
  deckId: string,
  transform: (deck: Deck) => Deck,
): boolean {
  const snapshot = getDeckSnapshot();
  const decks = snapshot.decks;
  const deckIndex = decks.findIndex(
    (deck) => deck.id === deckId,
  );

  if (deckIndex === -1) {
    return false;
  }

  const updatedDeck = transform(decks[deckIndex]);

  if (updatedDeck === decks[deckIndex]) {
    return false;
  }

  const nextDecks = [...decks];

  nextDecks[deckIndex] = updatedDeck;

  return saveDecks(nextDecks, snapshot);
}

function createDeck(
  name: string,
  format: DeckFormat,
): string | null {
  const trimmedName = name.trim();

  if (
    !trimmedName ||
    trimmedName.length > 60 ||
    !isDeckFormat(format)
  ) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const deckId = window.crypto.randomUUID();

  const newDeck: Deck = {
    id: deckId,
    name: trimmedName,
    format,
    cards: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const snapshot = getDeckSnapshot();
  const decks = snapshot.decks;
  const wasSaved = saveDecks([...decks, newDeck], snapshot);

  return wasSaved ? deckId : null;
}

function deleteDeck(deckId: string): boolean {
  const snapshot = getDeckSnapshot();
  const decks = snapshot.decks;
  const nextDecks = decks.filter(
    (deck) => deck.id !== deckId,
  );

  if (nextDecks.length === decks.length) {
    return false;
  }

  return saveDecks(nextDecks, snapshot);
}

function renameDeck(deckId: string, name: string): boolean {
  return updateStoredDeck(deckId, (deck) =>
    renameDeckRecord(deck, name),
  );
}

function setDeckFormat(
  deckId: string,
  format: DeckFormat,
): boolean {
  return updateStoredDeck(deckId, (deck) =>
    setDeckFormatRecord(deck, format),
  );
}

function addCard(
  deckId: string,
  card: Card,
  zone: DeckZone = "mainboard",
): boolean {
  return updateStoredDeck(deckId, (deck) =>
    addCardToDeckRecord(deck, card, zone),
  );
}

function setCardQuantity(
  deckId: string,
  oracleId: string,
  zone: DeckZone,
  quantity: number,
): boolean {
  return updateStoredDeck(deckId, (deck) =>
    setDeckEntryQuantity(
      deck,
      oracleId,
      zone,
      quantity,
    ),
  );
}

function moveCard(
  deckId: string,
  oracleId: string,
  fromZone: DeckZone,
  toZone: DeckZone,
): boolean {
  return updateStoredDeck(deckId, (deck) =>
    moveDeckEntry(deck, oracleId, fromZone, toZone),
  );
}

function removeCard(
  deckId: string,
  oracleId: string,
  zone: DeckZone,
): boolean {
  return updateStoredDeck(deckId, (deck) =>
    removeDeckEntry(deck, oracleId, zone),
  );
}

function importDeck(deck: Deck): string | null {
  const parsedDeck = parseDeckValue(deck);

  if (!parsedDeck) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const deckId = window.crypto.randomUUID();
  const importedDeck: Deck = {
    ...parsedDeck,
    id: deckId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const snapshot = getDeckSnapshot();
  const decks = snapshot.decks;
  const wasSaved = saveDecks([...decks, importedDeck], snapshot);

  return wasSaved ? deckId : null;
}

function subscribeToHydration(): () => void {
  return () => {};
}

function getClientReady(): boolean {
  return true;
}

function getServerReady(): boolean {
  return false;
}

export function DeckProvider({
  children,
}: DeckProviderProps) {
  const snapshot = useSyncExternalStore(
    subscribeToDecks,
    getDeckSnapshot,
    getServerDeckSnapshot,
  );

  const isReady = useSyncExternalStore(
    subscribeToHydration,
    getClientReady,
    getServerReady,
  );

  return (
    <DeckContext.Provider
      value={{
        decks: snapshot.decks,
        storageError: snapshot.error,
        isReady,
        createDeck,
        deleteDeck,
        renameDeck,
        setDeckFormat,
        addCard,
        setCardQuantity,
        moveCard,
        removeCard,
        importDeck,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

export function useDecks(): DeckContextValue {
  const context = useContext(DeckContext);

  if (!context) {
    throw new Error(
      "useDecks must be used inside DeckProvider.",
    );
  }

  return context;
}
