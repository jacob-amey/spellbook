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
  parseStoredDecks,
  serializeStoredDecks,
} from "@/lib/deck-serialization";
import type { Card } from "@/types/card";
import type {
  Deck,
  DeckFormat,
  DeckZone,
} from "@/types/deck";

const STORAGE_KEY = "spellbook.decks";
const DECKS_CHANGED_EVENT = "spellbook:decks-changed";
const EMPTY_DECKS: Deck[] = [];

type DeckContextValue = {
  decks: Deck[];
  isReady: boolean;
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

let cachedStorageValue: string | null | undefined;
let cachedDecks: Deck[] = EMPTY_DECKS;

function getDeckSnapshot(): Deck[] {
  let storedValue: string | null;

  try {
    storedValue = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedDecks;
  }

  if (storedValue === cachedStorageValue) {
    return cachedDecks;
  }

  cachedStorageValue = storedValue;
  cachedDecks = parseStoredDecks(storedValue);

  return cachedDecks;
}

function getServerDeckSnapshot(): Deck[] {
  return EMPTY_DECKS;
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

function saveDecks(decks: Deck[]): boolean {
  const storedValue = serializeStoredDecks(decks);

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      storedValue,
    );
  } catch {
    return false;
  }

  cachedStorageValue = storedValue;
  cachedDecks = decks;

  window.dispatchEvent(
    new Event(DECKS_CHANGED_EVENT),
  );

  return true;
}

function updateStoredDeck(
  deckId: string,
  transform: (deck: Deck) => Deck,
): boolean {
  const decks = getDeckSnapshot();
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

  return saveDecks(nextDecks);
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

  const decks = getDeckSnapshot();
  const wasSaved = saveDecks([...decks, newDeck]);

  return wasSaved ? deckId : null;
}

function deleteDeck(deckId: string): boolean {
  const decks = getDeckSnapshot();
  const nextDecks = decks.filter(
    (deck) => deck.id !== deckId,
  );

  if (nextDecks.length === decks.length) {
    return false;
  }

  return saveDecks(nextDecks);
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

  const decks = getDeckSnapshot();
  const wasSaved = saveDecks([...decks, importedDeck]);

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
  const decks = useSyncExternalStore(
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
        decks,
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
