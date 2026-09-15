import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ScryfallApiError,
  readScryfallResponse,
  loadFeaturedCards,
  loadNextCardPage,
  normalizeScryfallCard,
  normalizeScryfallCardDetails,
  searchCards,
  shuffleCards,
} from "@/lib/scryfall";
import type { ScryfallCard } from "@/types/scryfall";

import { createScryfallCard, createList, jsonResponse } from "@/tests/scryfall-fixtures";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("upstream response handling", () => {
  it.each([null, {}, "Unavailable"])("preserves HTTP status for malformed error payloads: %j", async (payload) => {
    await expect(readScryfallResponse(new Response(JSON.stringify(payload), { status: 503 }))).rejects.toMatchObject({ name: "ScryfallApiError", status: 503, code: "upstream_error" });
  });
  it.each([200, 502])("reports non-JSON responses without leaking a parser error (%s)", async (status) => {
    await expect(readScryfallResponse(new Response("<html>Gateway error</html>", { status }))).rejects.toMatchObject({ status: 502, message: "The card service returned an unreadable response. Please try again." });
  });
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
  it("can draw a later page and does not expose a sequential pagination cursor", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(createList([
        createScryfallCard("a", "Alpha"), createScryfallCard("b", "Beta"),
      ], { total_cards: 6, has_more: true })))
      .mockResolvedValueOnce(jsonResponse(createList([
        createScryfallCard("z", "Zulu"), createScryfallCard("y", "Yew"),
      ], { total_cards: 6, has_more: false })));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const result = await loadFeaturedCards(() => 0.99, controller.signal);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get("page")).toBe("3");
    controller.abort();
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true);
    expect(result.cards.map((card) => card.name)).toEqual(["Zulu", "Yew"]);
    expect(result.hasMore).toBe(false);
    expect(result.nextPage).toBeNull();
  });
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

  it("shuffles a single-page featured pool without a second request", async () => {
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
    expect(requestedUrl.searchParams.get("order")).toBe("name");
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
