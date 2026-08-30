import type { Card } from "@/types/card";
import {
  DECK_FORMATS,
  DECK_ZONES,
  type Deck,
  type DeckFormat,
  type DeckZone,
} from "@/types/deck";

export const MAX_CARD_QUANTITY = 999;

export function isDeckFormat(value: unknown): value is DeckFormat {
  return (
    typeof value === "string" &&
    DECK_FORMATS.some((format) => format === value)
  );
}

export function isDeckZone(value: unknown): value is DeckZone {
  return (
    typeof value === "string" &&
    DECK_ZONES.some((zone) => zone === value)
  );
}

function touchDeck(deck: Deck): Deck {
  return {
    ...deck,
    updatedAt: new Date().toISOString(),
  };
}

export function renameDeckRecord(deck: Deck, name: string): Deck {
  const trimmedName = name.trim();

  if (
    !trimmedName ||
    trimmedName.length > 60 ||
    trimmedName === deck.name
  ) {
    return deck;
  }

  return touchDeck({
    ...deck,
    name: trimmedName,
  });
}

export function setDeckFormatRecord(
  deck: Deck,
  format: DeckFormat,
): Deck {
  if (!isDeckFormat(format) || format === deck.format) {
    return deck;
  }

  return touchDeck({
    ...deck,
    format,
  });
}

export function addCardToDeckRecord(
  deck: Deck,
  card: Card,
  zone: DeckZone = "mainboard",
  quantity = 1,
): Deck {
  if (
    !isDeckZone(zone) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CARD_QUANTITY
  ) {
    return deck;
  }

  const existingIndex = deck.cards.findIndex(
    (entry) =>
      entry.card.oracleId === card.oracleId && entry.zone === zone,
  );

  if (existingIndex === -1) {
    return touchDeck({
      ...deck,
      cards: [...deck.cards, { card, quantity, zone }],
    });
  }

  const existingEntry = deck.cards[existingIndex];
  const nextQuantity = existingEntry.quantity + quantity;

  if (nextQuantity > MAX_CARD_QUANTITY) {
    return deck;
  }

  const nextCards = [...deck.cards];

  nextCards[existingIndex] = {
    ...existingEntry,
    quantity: nextQuantity,
  };

  return touchDeck({
    ...deck,
    cards: nextCards,
  });
}

export function setDeckEntryQuantity(
  deck: Deck,
  oracleId: string,
  zone: DeckZone,
  quantity: number,
): Deck {
  if (
    !oracleId ||
    !isDeckZone(zone) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0 ||
    quantity > MAX_CARD_QUANTITY
  ) {
    return deck;
  }

  const entryExists = deck.cards.some(
    (entry) =>
      entry.card.oracleId === oracleId && entry.zone === zone,
  );

  if (!entryExists) {
    return deck;
  }

  if (quantity === 0) {
    return removeDeckEntry(deck, oracleId, zone);
  }

  const currentEntry = deck.cards.find(
    (entry) =>
      entry.card.oracleId === oracleId && entry.zone === zone,
  );

  if (currentEntry?.quantity === quantity) {
    return deck;
  }

  return touchDeck({
    ...deck,
    cards: deck.cards.map((entry) =>
      entry.card.oracleId === oracleId && entry.zone === zone
        ? { ...entry, quantity }
        : entry,
    ),
  });
}

export function moveDeckEntry(
  deck: Deck,
  oracleId: string,
  fromZone: DeckZone,
  toZone: DeckZone,
): Deck {
  if (
    !oracleId ||
    !isDeckZone(fromZone) ||
    !isDeckZone(toZone) ||
    fromZone === toZone
  ) {
    return deck;
  }

  const sourceEntry = deck.cards.find(
    (entry) =>
      entry.card.oracleId === oracleId && entry.zone === fromZone,
  );

  if (!sourceEntry) {
    return deck;
  }

  const destinationEntry = deck.cards.find(
    (entry) =>
      entry.card.oracleId === oracleId && entry.zone === toZone,
  );

  if (
    destinationEntry &&
    destinationEntry.quantity + sourceEntry.quantity >
      MAX_CARD_QUANTITY
  ) {
    return deck;
  }

  const withoutSource = deck.cards.filter(
    (entry) =>
      !(
        entry.card.oracleId === oracleId &&
        entry.zone === fromZone
      ),
  );

  const nextCards = destinationEntry
    ? withoutSource.map((entry) =>
        entry.card.oracleId === oracleId && entry.zone === toZone
          ? {
              ...entry,
              quantity: entry.quantity + sourceEntry.quantity,
            }
          : entry,
      )
    : [...withoutSource, { ...sourceEntry, zone: toZone }];

  return touchDeck({
    ...deck,
    cards: nextCards,
  });
}

export function removeDeckEntry(
  deck: Deck,
  oracleId: string,
  zone: DeckZone,
): Deck {
  if (!oracleId || !isDeckZone(zone)) {
    return deck;
  }

  const nextCards = deck.cards.filter(
    (entry) =>
      !(
        entry.card.oracleId === oracleId && entry.zone === zone
      ),
  );

  if (nextCards.length === deck.cards.length) {
    return deck;
  }

  return touchDeck({
    ...deck,
    cards: nextCards,
  });
}

export function formatDeckFormat(format: DeckFormat): string {
  return format.charAt(0).toUpperCase() + format.slice(1);
}

export function formatDeckZone(zone: DeckZone): string {
  const labels: Record<DeckZone, string> = {
    mainboard: "Mainboard",
    sideboard: "Sideboard",
    commander: "Commander",
  };

  return labels[zone];
}
