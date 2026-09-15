import { describe, expect, it } from "vitest";
import { createSampleDeck } from "@/lib/sample-deck";
import { parseDeckValue, parseDeckImport, serializeDeckExport } from "@/lib/deck-serialization";
import { analyzeDeck } from "@/lib/deck-analysis";

describe("reviewer sample deck", () => {
  it("can be imported, analyzed, and backed up through the real deck boundary", () => {
    const deck = createSampleDeck();
    expect(parseDeckValue(deck)).not.toBeNull();
    expect(analyzeDeck(deck).totals.all).toBe(36);
    expect(parseDeckImport(serializeDeckExport(deck)).ok).toBe(true);
    expect(deck.cards.every(({ card }) => card.priceUsd === null)).toBe(true);
  });
});
