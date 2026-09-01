import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ScryfallApiError,
  loadFeaturedCards,
  loadNextCardPage,
  normalizeScryfallCard,
  normalizeScryfallCardDetails,
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
    rarity: "uncommon",
    lang: "en",
    layout: "normal",
    set_type: "expansion",
    finishes: ["nonfoil"],
    foil: false,
    nonfoil: true,
    promo: false,
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

    const result = await searchCards("  Lightning Bolt  ", "released");
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestedUrl.searchParams.get("q")).toBe("Lightning Bolt");
    expect(requestedUrl.searchParams.get("order")).toBe("released");
    expect(requestedUrl.searchParams.has("page")).toBe(false);
    expect(result.cards[0].name).toBe("Lightning Bolt");
  });

  it("requests every printing when the search view needs print-level results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(createList([createScryfallCard("bolt", "Lightning Bolt")])),
    );
    vi.stubGlobal("fetch", fetchMock);

    await searchCards("Lightning Bolt", "usd", "prints");
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);

    expect(requestedUrl.searchParams.get("unique")).toBe("prints");
    expect(requestedUrl.searchParams.get("order")).toBe("usd");
  });

  it("loads and shuffles featured cards with one random-order request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        createList([
          createScryfallCard("alpha", "Alpha"),
          createScryfallCard("beta", "Beta"),
        ]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await loadFeaturedCards(() => 0);
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestedUrl.searchParams.get("q")).toBe("game:paper");
    expect(requestedUrl.searchParams.get("order")).toBe("random");
    expect(requestedUrl.searchParams.has("page")).toBe(false);
    expect(result.cards.map((card) => card.name)).toEqual([
      "Beta",
      "Alpha",
    ]);
  });

  it("uses the featured-card path for a blank search", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(createList([createScryfallCard("random", "Random Card")])),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await searchCards("   ");
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as URL);

    expect(requestedUrl.searchParams.get("q")).toBe("game:paper");
    expect(result.cards[0].name).toBe("Random Card");
  });

  it("loads trusted pagination URLs and rejects other origins", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(createList([createScryfallCard("next", "Next Card")], {
        warnings: ["A test warning"],
      })),
    );
    vi.stubGlobal("fetch", fetchMock);

    const page = await loadNextCardPage(
      "https://api.scryfall.com/cards/search?q=elf&page=2",
    );

    expect(page.cards[0].name).toBe("Next Card");
    expect(page.warnings).toEqual(["A test warning"]);
    await expect(
      loadNextCardPage("https://example.com/cards/search?page=2"),
    ).rejects.toThrow("did not come from Scryfall");
  });

  it("turns an unsuccessful Scryfall response into a typed error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            object: "error",
            status: 404,
            code: "not_found",
            details: "No cards found",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(searchCards("impossible query")).rejects.toMatchObject({
      name: "ScryfallApiError",
      status: 404,
      code: "not_found",
      message: "No cards found",
    });

    const fallbackError = new ScryfallApiError({
      object: "error",
      status: 500,
      code: "server_error",
      details: "",
    });

    expect(fallbackError.message).toBe("Scryfall could not complete the request");
  });
});

describe("Scryfall card normalization", () => {
  it("combines double-faced card data and fallback values", () => {
    const card: ScryfallCard = {
      ...createScryfallCard("double", "Front // Back"),
      oracle_id: null,
      mana_cost: null,
      oracle_text: null,
      prices: { usd: null, usd_foil: "2.50" },
      artist: null,
      card_faces: [
        {
          name: "Front",
          mana_cost: "{1}{U}",
          oracle_text: "Draw a card.",
          image_uris: {
            small: "https://cards.scryfall.io/small/front.jpg",
            normal: "https://cards.scryfall.io/normal/front.jpg",
            large: "https://cards.scryfall.io/large/front.jpg",
            png: "https://cards.scryfall.io/png/front.png",
            art_crop: "https://cards.scryfall.io/art/front.jpg",
            border_crop: "https://cards.scryfall.io/border/front.jpg",
          },
        },
        {
          name: "Back",
          mana_cost: "",
          oracle_text: "Create a token.",
        },
      ],
    };

    const normalized = normalizeScryfallCard(card);

    expect(normalized.oracleId).toBe("double");
    expect(normalized.manaCost).toBe("{1}{U}");
    expect(normalized.oracleText).toBe("Draw a card. // Create a token.");
    expect(normalized.imageUrl).toContain("front.jpg");
    expect(normalized.priceUsd).toBe("2.50");
    expect(normalized.artist).toBeNull();
  });

  it("normalizes research fields, prices, faces, and purchase links", () => {
    const card: ScryfallCard = {
      ...createScryfallCard("detail", "Detailed Card"),
      flavor_text: "A test story.",
      printed_name: "Printed card",
      printed_text: "Printed rules.",
      printed_type_line: "Printed type",
      loyalty: "4",
      finishes: ["nonfoil", "foil"],
      foil: true,
      prices: {
        usd: "1.00",
        usd_foil: "2.00",
        usd_etched: "3.00",
        eur: "1.50",
        eur_foil: "2.50",
        tix: "0.10",
      },
      purchase_uris: {
        tcgplayer: "https://example.com/tcg",
        cardmarket: "https://example.com/market",
        cardhoarder: "https://example.com/hoarder",
      },
      card_faces: [
        {
          name: "Detailed Face",
          mana_cost: "{1}",
          type_line: "Artifact",
          oracle_text: "Test rules text.",
          flavor_text: "Face story.",
          artist: "Face Artist",
          power: "2",
          toughness: "3",
          loyalty: "4",
        },
      ],
    };

    const normalized = normalizeScryfallCardDetails(card);

    expect(normalized.flavorText).toBe("A test story.");
    expect(normalized.printedText).toBe("Printed rules.");
    expect(normalized.prices).toEqual({
      usd: "1.00",
      usdFoil: "2.00",
      usdEtched: "3.00",
      eur: "1.50",
      eurFoil: "2.50",
      tix: "0.10",
    });
    expect(normalized.cardFaces[0]).toMatchObject({
      artist: "Face Artist",
      power: "2",
      toughness: "3",
    });
    expect(normalized.purchaseUris.tcgplayer).toContain("tcg");
  });
});
