import { describe, expect, it } from "vitest";

import {
  DECK_STORAGE_VERSION,
  MAX_DECK_IMPORT_SIZE,
  createDeckFileName,
  parseDeckImport,
  parseDeckValue,
  parseStoredDecks,
  serializeDeckExport,
  serializeDeckText,
  serializeStoredDecks,
} from "@/lib/deck-serialization";
import {
  createCard,
  createDeck,
  createEntry,
} from "@/tests/deck-fixtures";

describe("stored deck serialization", () => {
  it("round-trips valid saved decks", () => {
    const deck = createDeck({
      cards: [createEntry(createCard(), 4)],
    });

    const parsedDecks = parseStoredDecks(
      serializeStoredDecks([deck]),
    );

    expect(parsedDecks).toEqual([deck]);
  });

  it("recovers safely from empty, malformed, or unsupported storage", () => {
    expect(parseStoredDecks(null)).toEqual([]);
    expect(parseStoredDecks("not json")).toEqual([]);
    expect(
      parseStoredDecks(
        JSON.stringify({
          version: DECK_STORAGE_VERSION + 1,
          decks: [],
        }),
      ),
    ).toEqual([]);
  });

  it("keeps valid decks while dropping invalid stored entries", () => {
    const validDeck = createDeck();
    const invalidDeck = { ...createDeck(), name: "" };

    const parsedDecks = parseStoredDecks(
      JSON.stringify({
        version: DECK_STORAGE_VERSION,
        decks: [validDeck, invalidDeck],
      }),
    );

    expect(parsedDecks).toEqual([validDeck]);
  });
});

describe("runtime deck validation", () => {
  it("merges duplicate card entries in the same zone", () => {
    const card = createCard();
    const deck = createDeck({
      cards: [
        createEntry(card, 2, "mainboard"),
        createEntry(
          createCard({ id: "alternate-printing" }),
          3,
          "mainboard",
        ),
        createEntry(card, 1, "sideboard"),
      ],
    });

    const parsedDeck = parseDeckValue(deck);

    expect(parsedDeck?.cards).toHaveLength(2);
    expect(parsedDeck?.cards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          quantity: 5,
          zone: "mainboard",
        }),
        expect.objectContaining({
          quantity: 1,
          zone: "sideboard",
        }),
      ]),
    );
  });

  it.each([
    ["unsupported format", { format: "alchemy" }],
    ["empty name", { name: "" }],
    ["invalid creation date", { createdAt: "yesterday-ish" }],
    ["non-array cards", { cards: null }],
  ])("rejects a deck with %s", (_description, overrides) => {
    expect(
      parseDeckValue({ ...createDeck(), ...overrides }),
    ).toBeNull();
  });

  it("rejects invalid quantities and unsafe card URLs", () => {
    const card = createCard();
    const invalidQuantityDeck = createDeck({
      cards: [createEntry(card, 0)],
    });
    const unsafeImageDeck = createDeck({
      cards: [
        createEntry(
          createCard({
            imageUrl: "https://example.com/card.jpg",
          }),
        ),
      ],
    });
    const unsafeCardLinkDeck = createDeck({
      cards: [
        createEntry(
          createCard({
            scryfallUrl:
              "https://example.com/card/lea/161/lightning-bolt",
          }),
        ),
      ],
    });

    expect(parseDeckValue(invalidQuantityDeck)).toBeNull();
    expect(parseDeckValue(unsafeImageDeck)).toBeNull();
    expect(parseDeckValue(unsafeCardLinkDeck)).toBeNull();
  });

  it("accepts cards without optional image and price data", () => {
    const card = createCard({
      imageUrl: null,
      priceUsd: null,
      artist: null,
      manaCost: "",
      oracleText: "",
    });

    expect(
      parseDeckValue(
        createDeck({ cards: [createEntry(card)] }),
      ),
    ).not.toBeNull();
  });
});

describe("deck file import and export", () => {
  it("round-trips a Spellbook JSON export", () => {
    const deck = createDeck({
      name: "Burn & Learn",
      cards: [createEntry(createCard(), 4)],
    });

    const result = parseDeckImport(serializeDeckExport(deck));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deck).toEqual(deck);
    }
  });

  it("returns specific errors for unsupported import files", () => {
    expect(parseDeckImport("   ")).toEqual({
      ok: false,
      error: "Choose a nonempty Spellbook JSON file.",
    });
    expect(parseDeckImport("not json")).toEqual({
      ok: false,
      error: "The selected file is not valid JSON.",
    });
    expect(
      parseDeckImport(JSON.stringify({ schema: "another-app" })),
    ).toEqual({
      ok: false,
      error: "This is not a supported Spellbook deck export.",
    });
    expect(
      parseDeckImport("x".repeat(MAX_DECK_IMPORT_SIZE + 1)),
    ).toEqual({
      ok: false,
      error: "That deck file is larger than 2 MB.",
    });
  });

  it("rejects an export containing unsafe deck data", () => {
    const unsafeDeck = createDeck({
      cards: [
        createEntry(
          createCard({
            imageUrl: "https://example.com/card.jpg",
          }),
        ),
      ],
    });
    const source = JSON.stringify({
      schema: "spellbook.deck",
      version: DECK_STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      deck: unsafeDeck,
    });

    expect(parseDeckImport(source)).toEqual({
      ok: false,
      error: "The deck file contains invalid or unsafe card data.",
    });
  });

  it("exports readable text grouped and sorted by zone", () => {
    const alphaCard = createCard({
      id: "printing-alpha",
      oracleId: "oracle-alpha",
      name: "Alpha Card",
    });
    const zuluCard = createCard({
      id: "printing-zulu",
      oracleId: "oracle-zulu",
      name: "Zulu Card",
    });
    const commander = createCard({
      id: "printing-commander",
      oracleId: "oracle-commander",
      name: "Deck Commander",
    });
    const deck = createDeck({
      name: "Ordered Deck",
      format: "commander",
      cards: [
        createEntry(zuluCard, 2),
        createEntry(alphaCard, 1),
        createEntry(commander, 1, "commander"),
      ],
    });

    expect(serializeDeckText(deck)).toBe(
      [
        "Ordered Deck (commander)",
        "",
        "Commander:",
        "1 Deck Commander",
        "",
        "Mainboard:",
        "1 Alpha Card",
        "2 Zulu Card",
        "",
      ].join("\n"),
    );
  });

  it("creates safe, useful export file names", () => {
    expect(createDeckFileName("  My Deck!  ", "json")).toBe(
      "my-deck.json",
    );
    expect(createDeckFileName("!!!", "txt")).toBe(
      "spellbook-deck.txt",
    );
  });
});
