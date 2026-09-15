import { afterEach, describe, expect, it, vi } from "vitest";
import { autocompleteCardNames, getCardById, getCardDetailsBundle } from "@/lib/scryfall-server";
import { createList, createScryfallCard, jsonResponse } from "@/tests/scryfall-fixtures";

const cardId = "ba93c50a-2440-4e92-9cba-d97e20b1d29c";
const oracleId = "a093c50a-2440-4e92-9cba-d97e20b1d29c";
const card = { ...createScryfallCard(cardId, "Test Card"), oracle_id: oracleId };
afterEach(() => vi.unstubAllGlobals());

describe("card research requests", () => {
  it("filters invalid and duplicate autocomplete entries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: [null, 3, "", "  ", "Lightning Bolt", "Lightning Bolt"] })));
    expect(await autocompleteCardNames("bolt")).toEqual(["Lightning Bolt"]);
  });

  it.each([null, {}, { data: "unexpected" }])("rejects invalid suggestion responses: %j", async (payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));
    await expect(autocompleteCardNames("bolt")).rejects.toMatchObject({ status: 502 });
  });
  it("loads complete research data and preserves total printing counts", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse(card))
      .mockResolvedValueOnce(jsonResponse(createList([card], { total_cards: 220, has_more: true })))
      .mockResolvedValueOnce(jsonResponse({ data: [{ oracle_id: oracleId, published_at: "2026-01-01", source: "wotc", comment: "A ruling." }] })));
    const bundle = await getCardDetailsBundle(cardId);
    expect(bundle.printings?.totalCards).toBe(220);
    expect(bundle.rulings?.[0].comment).toBe("A ruling.");
  });

  it.each(["printings", "rulings"])("keeps the card usable when %s fails", async (failed) => {
    vi.stubGlobal("fetch", vi.fn(async (url: URL) => {
      if (url.pathname === `/cards/${cardId}`) return jsonResponse(card);
      if (url.pathname.includes(failed === "printings" ? "search" : "rulings")) throw new Error("Unavailable");
      return jsonResponse(createList([]));
    }));
    const bundle = await getCardDetailsBundle(cardId);
    expect(bundle.card.name).toBe("Test Card");
    expect(bundle[failed as "printings" | "rulings"]).toBeNull();
    expect(bundle[failed === "printings" ? "rulings" : "printings"]).not.toBeNull();
  });

  it("treats no paper printings as empty instead of a missing card", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse(card))
      .mockResolvedValueOnce(new Response(JSON.stringify({ object: "error", status: 404, code: "not_found", details: "No cards" }), { status: 404 }))
      .mockResolvedValueOnce(jsonResponse({ data: [] })));
    const bundle = await getCardDetailsBundle(cardId);
    expect(bundle.printings).toEqual({ cards: [], totalCards: 0 });
    expect(bundle.rulings).toEqual([]);
  });

  it("still rejects a missing primary card and invalid identifiers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ object: "error", status: 404, code: "not_found", details: "Missing" }), { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getCardById("../../unexpected")).rejects.toMatchObject({ status: 404 });
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(getCardDetailsBundle(cardId)).rejects.toMatchObject({ status: 404 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("limits autocomplete input and output", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: Array.from({ length: 20 }, (_, index) => `Card ${index}`) }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await autocompleteCardNames("a")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await autocompleteCardNames("x".repeat(100))).toHaveLength(8);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("q")).toHaveLength(64);
  });
});
