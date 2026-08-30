import type { Card } from "@/types/card";
import type {
  Deck,
  DeckEntry,
  DeckFormat,
  DeckZone,
} from "@/types/deck";

const TEST_TIMESTAMP = "2026-01-15T12:00:00.000Z";

export function createCard(
  overrides: Partial<Card> = {},
): Card {
  return {
    id: "printing-lightning-bolt",
    oracleId: "oracle-lightning-bolt",
    name: "Lightning Bolt",
    setCode: "lea",
    setName: "Limited Edition Alpha",
    collectorNumber: "161",
    releasedAt: "1993-08-05",
    manaCost: "{R}",
    manaValue: 1,
    typeLine: "Instant",
    oracleText: "Lightning Bolt deals 3 damage to any target.",
    power: null,
    toughness: null,
    keywords: [],
    colorIdentity: ["R"],
    legalities: {
      commander: "legal",
      legacy: "legal",
      modern: "legal",
      pauper: "legal",
      pioneer: "not_legal",
      standard: "not_legal",
      vintage: "legal",
    },
    imageUrl:
      "https://cards.scryfall.io/normal/front/a/b/test-card.jpg",
    priceUsd: "1.25",
    artist: "Test Artist",
    scryfallUrl:
      "https://scryfall.com/card/lea/161/lightning-bolt",
    ...overrides,
  };
}

export function createEntry(
  card = createCard(),
  quantity = 1,
  zone: DeckZone = "mainboard",
): DeckEntry {
  return { card, quantity, zone };
}

type DeckOverrides = Omit<Partial<Deck>, "cards" | "format"> & {
  cards?: DeckEntry[];
  format?: DeckFormat;
};

export function createDeck(
  overrides: DeckOverrides = {},
): Deck {
  return {
    id: "deck-test",
    name: "Test Deck",
    format: "casual",
    cards: [],
    createdAt: TEST_TIMESTAMP,
    updatedAt: TEST_TIMESTAMP,
    ...overrides,
  };
}
