import type { ScryfallCard, ScryfallList } from "@/types/scryfall";

export function createScryfallCard(
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

export function createList(
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

export function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

