import { describe, expect, it } from "vitest";
import { MAX_DECK_ENTRIES } from "@/types/deck";

import {
  MAX_CARD_QUANTITY,
  addCardToDeckRecord,
  formatDeckFormat,
  formatDeckZone,
  isDeckFormat,
  isDeckZone,
  moveDeckEntry,
  removeDeckEntry,
  renameDeckRecord,
  setDeckEntryQuantity,
  setDeckFormatRecord,
} from "@/lib/deck-operations";
import {
  createCard,
  createDeck,
  createEntry,
} from "@/tests/deck-fixtures";

describe("deck value guards and labels", () => {
  it("recognizes supported formats and zones", () => {
    expect(isDeckFormat("commander")).toBe(true);
    expect(isDeckFormat("alchemy")).toBe(false);
    expect(isDeckFormat(null)).toBe(false);

    expect(isDeckZone("sideboard")).toBe(true);
    expect(isDeckZone("maybeboard")).toBe(false);
    expect(isDeckZone(undefined)).toBe(false);
  });

  it("formats values for the interface", () => {
    expect(formatDeckFormat("pioneer")).toBe("Pioneer");
    expect(formatDeckZone("commander")).toBe("Commander");
  });
});

describe("deck metadata operations", () => {
  it("trims a valid new name without mutating the source deck", () => {
    const deck = createDeck();
    const renamedDeck = renameDeckRecord(deck, "  Burn Spells  ");

    expect(renamedDeck).not.toBe(deck);
    expect(renamedDeck.name).toBe("Burn Spells");
    expect(renamedDeck.updatedAt).not.toBe(deck.updatedAt);
    expect(deck.name).toBe("Test Deck");
  });

  it("ignores empty, unchanged, and overlong names", () => {
    const deck = createDeck();

    expect(renameDeckRecord(deck, "   ")).toBe(deck);
    expect(renameDeckRecord(deck, deck.name)).toBe(deck);
    expect(renameDeckRecord(deck, "a".repeat(61))).toBe(deck);
  });

  it("changes a valid format and ignores the current format", () => {
    const deck = createDeck();
    const updatedDeck = setDeckFormatRecord(deck, "modern");

    expect(updatedDeck).not.toBe(deck);
    expect(updatedDeck.format).toBe("modern");
    expect(setDeckFormatRecord(updatedDeck, "modern")).toBe(
      updatedDeck,
    );
  });
});

describe("card quantity and zone operations", () => {
  it("does not create a deck too large to reload or import", () => {
    const deck = createDeck({ cards: Array.from({ length: MAX_DECK_ENTRIES }, (_, index) =>
      createEntry(createCard({ oracleId: `card-${index}` })),
    ) });
    expect(addCardToDeckRecord(deck, createCard())).toBe(deck);
    expect(addCardToDeckRecord(deck, deck.cards[0].card).cards[0].quantity).toBe(2);
  });
  it("adds a card without mutating the source deck", () => {
    const deck = createDeck();
    const card = createCard();
    const updatedDeck = addCardToDeckRecord(deck, card);

    expect(updatedDeck).not.toBe(deck);
    expect(deck.cards).toEqual([]);
    expect(updatedDeck.cards).toEqual([
      { card, quantity: 1, zone: "mainboard" },
    ]);
  });

  it("merges alternate printings with the same Oracle ID", () => {
    const firstPrinting = createCard();
    const alternatePrinting = createCard({
      id: "printing-lightning-bolt-two",
      setCode: "m10",
    });
    const deck = createDeck({
      cards: [createEntry(firstPrinting, 2)],
    });

    const updatedDeck = addCardToDeckRecord(
      deck,
      alternatePrinting,
      "mainboard",
      2,
    );

    expect(updatedDeck.cards).toHaveLength(1);
    expect(updatedDeck.cards[0].quantity).toBe(4);
    expect(updatedDeck.cards[0].card.id).toBe(firstPrinting.id);
  });

  it("keeps copies in different deck zones separate", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [createEntry(card, 2, "mainboard")],
    });

    const updatedDeck = addCardToDeckRecord(
      deck,
      card,
      "sideboard",
      1,
    );

    expect(updatedDeck.cards).toHaveLength(2);
    expect(updatedDeck.cards[1]).toMatchObject({
      quantity: 1,
      zone: "sideboard",
    });
  });

  it("rejects invalid and overflowing additions", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [
        createEntry(card, MAX_CARD_QUANTITY, "mainboard"),
      ],
    });

    expect(addCardToDeckRecord(deck, card, "mainboard", 1)).toBe(
      deck,
    );
    expect(addCardToDeckRecord(deck, card, "mainboard", 0)).toBe(
      deck,
    );
  });

  it("updates a quantity and removes an entry at zero", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [createEntry(card, 2)],
    });

    const increasedDeck = setDeckEntryQuantity(
      deck,
      card.oracleId,
      "mainboard",
      4,
    );
    const removedDeck = setDeckEntryQuantity(
      increasedDeck,
      card.oracleId,
      "mainboard",
      0,
    );

    expect(increasedDeck.cards[0].quantity).toBe(4);
    expect(deck.cards[0].quantity).toBe(2);
    expect(removedDeck.cards).toEqual([]);
  });

  it("ignores quantity changes for missing entries or invalid values", () => {
    const deck = createDeck({
      cards: [createEntry()],
    });

    expect(
      setDeckEntryQuantity(
        deck,
        "missing-oracle-id",
        "mainboard",
        2,
      ),
    ).toBe(deck);
    expect(
      setDeckEntryQuantity(
        deck,
        deck.cards[0].card.oracleId,
        "mainboard",
        MAX_CARD_QUANTITY + 1,
      ),
    ).toBe(deck);
  });

  it("moves a card to an empty zone", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [createEntry(card, 2)],
    });

    const updatedDeck = moveDeckEntry(
      deck,
      card.oracleId,
      "mainboard",
      "sideboard",
    );

    expect(updatedDeck.cards).toEqual([
      { card, quantity: 2, zone: "sideboard" },
    ]);
  });

  it("merges quantities when moving into an occupied zone", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [
        createEntry(card, 2, "mainboard"),
        createEntry(card, 3, "sideboard"),
      ],
    });

    const updatedDeck = moveDeckEntry(
      deck,
      card.oracleId,
      "mainboard",
      "sideboard",
    );

    expect(updatedDeck.cards).toEqual([
      { card, quantity: 5, zone: "sideboard" },
    ]);
  });

  it("rejects a zone move that would overflow the quantity limit", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [
        createEntry(card, 1, "mainboard"),
        createEntry(
          card,
          MAX_CARD_QUANTITY,
          "sideboard",
        ),
      ],
    });

    expect(
      moveDeckEntry(
        deck,
        card.oracleId,
        "mainboard",
        "sideboard",
      ),
    ).toBe(deck);
  });

  it("removes only the matching card and zone", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [
        createEntry(card, 2, "mainboard"),
        createEntry(card, 1, "sideboard"),
      ],
    });

    const updatedDeck = removeDeckEntry(
      deck,
      card.oracleId,
      "mainboard",
    );

    expect(updatedDeck.cards).toEqual([
      { card, quantity: 1, zone: "sideboard" },
    ]);
    expect(
      removeDeckEntry(deck, "missing-oracle-id", "mainboard"),
    ).toBe(deck);
  });
});
