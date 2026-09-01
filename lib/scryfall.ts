import type {
  Card,
  CardDetails,
  CardSearchPage,
} from "@/types/card";
import type {
  ScryfallCard,
  ScryfallCardFace,
  ScryfallError,
  ScryfallList,
} from "@/types/scryfall";

const SCRYFALL_API_ORIGIN = "https://api.scryfall.com";
const SCRYFALL_PAGE_SIZE = 175;
const FEATURED_QUERY = "game:paper";

export const SCRYFALL_SORT_ORDERS = [
  "name",
  "released",
  "rarity",
  "color",
  "usd",
  "cmc",
  "edhrec",
] as const;

export type ScryfallSortOrder = (typeof SCRYFALL_SORT_ORDERS)[number];
export type ScryfallUniqueMode = "cards" | "prints";

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

export function normalizeScryfallCardDetails(
  card: ScryfallCard,
): CardDetails {
  const normalizedCard = normalizeScryfallCard(card);

  return {
    ...normalizedCard,
    rarity: card.rarity,
    language: card.lang,
    layout: card.layout,
    setType: card.set_type,
    flavorText: card.flavor_text ?? "",
    loyalty: card.loyalty ?? null,
    printedName: card.printed_name ?? null,
    printedText: card.printed_text ?? null,
    printedTypeLine: card.printed_type_line ?? null,
    cardFaces:
      card.card_faces?.map((face) => ({
        name: face.name,
        manaCost: face.mana_cost ?? "",
        typeLine: face.type_line ?? "",
        oracleText: face.oracle_text ?? "",
        flavorText: face.flavor_text ?? "",
        artist: face.artist ?? card.artist ?? null,
        power: face.power ?? null,
        toughness: face.toughness ?? null,
        loyalty: face.loyalty ?? null,
        imageUrl: face.image_uris?.normal ?? null,
      })) ?? [],
    prices: {
      usd: card.prices.usd ?? null,
      usdFoil: card.prices.usd_foil ?? null,
      usdEtched: card.prices.usd_etched ?? null,
      eur: card.prices.eur ?? null,
      eurFoil: card.prices.eur_foil ?? null,
      tix: card.prices.tix ?? null,
    },
    finishes: [...card.finishes],
    foil: card.foil,
    nonfoil: card.nonfoil,
    promo: card.promo,
    purchaseUris: {
      tcgplayer: card.purchase_uris?.tcgplayer ?? null,
      cardmarket: card.purchase_uris?.cardmarket ?? null,
      cardhoarder: card.purchase_uris?.cardhoarder ?? null,
    },
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

function createSearchUrl(
  query: string,
  order: ScryfallSortOrder = "name",
  unique: ScryfallUniqueMode = "cards",
  page?: number,
): URL {
  const url = new URL("/cards/search", SCRYFALL_API_ORIGIN);

  url.searchParams.set("q", query);
  url.searchParams.set("unique", unique);
  url.searchParams.set("order", order);

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
          createSearchUrl(
            FEATURED_QUERY,
            "name",
            "cards",
            randomPageNumber,
          ),
        );

  return {
    ...selectedPage,
    cards: shuffleCards(selectedPage.cards, random),
  };
}

export async function searchCards(
  query: string,
  order: ScryfallSortOrder = "name",
  unique: ScryfallUniqueMode = "cards",
): Promise<CardSearchPage> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return loadFeaturedCards();
  }

  return requestCardPage(createSearchUrl(trimmedQuery, order, unique));
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
