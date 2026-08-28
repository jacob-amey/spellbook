"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Deck, DeckFormat } from "@/types/deck";

const STORAGE_KEY = "spellbook.decks";
const STORAGE_VERSION = 1;
const DECKS_CHANGED_EVENT = "spellbook:decks-changed";

const EMPTY_DECKS: Deck[] = [];

type DeckContextValue = {
  decks: Deck[];
  isReady: boolean;
  createDeck: (
    name: string,
    format: DeckFormat,
  ) => string | null;
};

type DeckProviderProps = {
  children: ReactNode;
};

type StoreListener = () => void;

const DeckContext = createContext<DeckContextValue | null>(
  null,
);

let cachedStorageValue: string | null | undefined;
let cachedDecks: Deck[] = EMPTY_DECKS;

function parseStoredDecks(
  storedValue: string | null,
): Deck[] {
  if (!storedValue) {
    return EMPTY_DECKS;
  }

  try {
    const parsedData: unknown = JSON.parse(storedValue);

    if (
      typeof parsedData !== "object" ||
      parsedData === null ||
      !("version" in parsedData) ||
      parsedData.version !== STORAGE_VERSION ||
      !("decks" in parsedData) ||
      !Array.isArray(parsedData.decks)
    ) {
      return EMPTY_DECKS;
    }

    return parsedData.decks as Deck[];
  } catch {
    return EMPTY_DECKS;
  }
}

function getDeckSnapshot(): Deck[] {
  let storedValue: string | null;

  try {
    storedValue =
      window.localStorage.getItem(STORAGE_KEY);
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
  const storedValue = JSON.stringify({
    version: STORAGE_VERSION,
    decks,
  });

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

  function createDeck(
    name: string,
    format: DeckFormat,
  ): string | null {
    const trimmedName = name.trim();

    if (!trimmedName) {
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

    const currentDecks = getDeckSnapshot();
    const wasSaved = saveDecks([
      ...currentDecks,
      newDeck,
    ]);

    return wasSaved ? deckId : null;
  }

  return (
    <DeckContext.Provider
      value={{
        decks,
        isReady,
        createDeck,
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