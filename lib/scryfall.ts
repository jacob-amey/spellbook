import type { Card, CardSearchPage } from "@/types/card";
import type {
  ScryfallCard,
  ScryfallCardFace,
  ScryfallError,
  ScryfallList,
} from "@/types/scryfall";

const SCRYFALL_API_ORIGIN = "https://api.scryfall.com";
const SCRYFALL_PAGE_SIZE = 175;
const FEATURED_QUERY = "game:paper";

export class ScryfallApiError extends Error {
  status: number;
  code: string;

  constructor(error: ScryfallError) {
    super(error.details || "Scryfall could not complete the request");

    this.name = "ScryfallApiError";
    this.status = error.status;
    this.code = error.code;
  }
}

function combineFaceText(
  faces: ScryfallCardFace[] | null | undefined,
  field: "mana_cost" | "oracle_text",
) {
  return (
    faces
      ?.map((face) => face[field])
      .filter((value): value is string => Boolean(value))
      .join(" // ") ?? ""
  );
}

export function normalizeScryfallCard(card: ScryfallCard): Card {
  return {
    id: card.id,
    oracleId: card.oracle_id ?? card.id,
    name: card.name,

    setCode: card.set,
    setName: card.set_name,
    collectorNumber: card.collector_number,
    releasedAt: card.released_at,

    manaCost:
      card.mana_cost ?? combineFaceText(card.card_faces, "mana_cost"),
    manaValue: card.cmc,
    typeLine: card.type_line,
    oracleText:
      card.oracle_text ?? combineFaceText(card.card_faces, "oracle_text"),

    power: card.power ?? null,
    toughness: card.toughness ?? null,
    keywords: card.keywords,

    colorIdentity: card.color_identity,
    legalities: card.legalities,

    imageUrl:
      card.image_uris?.normal ??
      card.card_faces?.[0]?.image_uris?.normal ??
      null,

    priceUsd: card.prices.usd ?? card.prices.usd_foil ?? null,

    artist: card.artist ?? null,
    scryfallUrl: card.scryfall_uri,
  };
}

export function shuffleCards<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createSearchUrl(query: string, page?: number): URL {
  const url = new URL("/cards/search", SCRYFALL_API_ORIGIN);

  url.searchParams.set("q", query);
  url.searchParams.set("unique", "cards");
  url.searchParams.set("order", "name");

  if (page !== undefined) {
    url.searchParams.set("page", page.toString());
  }

  return url;
}

async function requestCardPage(url: URL): Promise<CardSearchPage> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json;q=0.9,*/*;q=0.8",
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new ScryfallApiError(payload as ScryfallError);
  }

  const result = payload as ScryfallList<ScryfallCard>;

  return {
    cards: result.data.map(normalizeScryfallCard),
    totalCards: result.total_cards ?? result.data.length,
    hasMore: result.has_more,
    nextPage: result.next_page ?? null,
    warnings: result.warnings ?? [],
  };
}

export async function loadFeaturedCards(
  random: () => number = Math.random,
): Promise<CardSearchPage> {
  const firstPage = await requestCardPage(createSearchUrl(FEATURED_QUERY));
  const pageCount = Math.max(
    1,
    Math.ceil(firstPage.totalCards / SCRYFALL_PAGE_SIZE),
  );
  const randomPageNumber = Math.floor(random() * pageCount) + 1;

  const selectedPage =
    randomPageNumber === 1
      ? firstPage
      : await requestCardPage(
          createSearchUrl(FEATURED_QUERY, randomPageNumber),
        );

  return {
    ...selectedPage,
    cards: shuffleCards(selectedPage.cards, random),
  };
}

export async function searchCards(query: string): Promise<CardSearchPage> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return loadFeaturedCards();
  }

  return requestCardPage(createSearchUrl(trimmedQuery));
}

export async function loadNextCardPage(
  nextPageUrl: string,
): Promise<CardSearchPage> {
  const url = new URL(nextPageUrl);

  if (url.origin !== SCRYFALL_API_ORIGIN) {
    throw new Error("The next page URL did not come from Scryfall");
  }

  return requestCardPage(url);
}
