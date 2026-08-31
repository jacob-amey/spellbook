import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadFeaturedCards,
  searchCards,
  shuffleCards,
} from "@/lib/scryfall";
import type { ScryfallCard, ScryfallList } from "@/types/scryfall";

function createScryfallCard(
  id: string,
  name: string,
): ScryfallCard {
  return {
    id,
    oracle_id: `oracle-${id}`,
    name,
    set: "tst",
    set_name: "Test Set",
    collector_number: "1",
    released_at: "2026-01-01",
    mana_cost: "{1}",
    cmc: 1,
    type_line: "Artifact",
    oracle_text: "Test rules text.",
    keywords: [],
    color_identity: [],
    legalities: { commander: "legal" },
    prices: { usd: "1.00" },
    artist: "Test Artist",
    scryfall_uri: `https://scryfall.com/card/tst/1/${id}`,
  };
}

function createList(
  cards: ScryfallCard[],
  overrides: Partial<ScryfallList<ScryfallCard>> = {},
): ScryfallList<ScryfallCard> {
  return {
    object: "list",
    data: cards,
    has_more: false,
    total_cards: cards.length,
    ...overrides,
  };
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("shuffleCards", () => {
  it("returns a shuffled copy without changing the original array", () => {
    const cards = ["one", "two", "three"];

    expect(shuffleCards(cards, () => 0)).toEqual([
      "two",
      "three",
      "one",
    ]);
    expect(cards).toEqual(["one", "two", "three"]);
  });
});

describe("Scryfall catalogue loading", () => {
  it("keeps a submitted search on the first matching page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        createList([createScryfallCard("bolt", "Lightning Bolt")]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchCards("  Lightning Bolt  ");
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestedUrl.searchParams.get("q")).toBe("Lightning Bolt");
    expect(requestedUrl.searchParams.has("page")).toBe(false);
    expect(result.cards[0].name).toBe("Lightning Bolt");
  });

  it("chooses and shuffles a random page for featured cards", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          createList([createScryfallCard("first", "First Page Card")], {
            has_more: true,
            next_page:
              "https://api.scryfall.com/cards/search?q=game%3Apaper&page=2",
            total_cards: 350,
          }),
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          createList(
            [
              createScryfallCard("alpha", "Alpha"),
              createScryfallCard("beta", "Beta"),
            ],
            { total_cards: 350 },
          ),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const randomValues = [0.75, 0];
    const result = await loadFeaturedCards(
      () => randomValues.shift() ?? 0,
    );
    const requestedUrl = new URL(fetchMock.mock.calls[1][0] as URL);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestedUrl.searchParams.get("q")).toBe("game:paper");
    expect(requestedUrl.searchParams.get("page")).toBe("2");
    expect(result.cards.map((card) => card.name)).toEqual([
      "Beta",
      "Alpha",
    ]);
  });
});
