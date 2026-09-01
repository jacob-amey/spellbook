import "server-only";

import {
  normalizeScryfallCardDetails,
  ScryfallApiError,
} from "@/lib/scryfall";
import type {
  CardDetails,
  CardDetailsBundle,
  CardRuling,
} from "@/types/card";
import type {
  ScryfallAutocomplete,
  ScryfallCard,
  ScryfallError,
  ScryfallList,
  ScryfallRuling,
} from "@/types/scryfall";

const SCRYFALL_API_ORIGIN = "https://api.scryfall.com";
const SCRYFALL_HEADERS = {
  Accept: "application/json;q=0.9,*/*;q=0.8",
  "User-Agent": "Spellbook/0.1",
};
const SCRYFALL_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createNotFoundError(details = "That card could not be found") {
  return new ScryfallApiError({
    object: "error",
    status: 404,
    code: "not_found",
    details,
  });
}

async function requestScryfall<T>(
  path: string,
  searchParams?: URLSearchParams,
): Promise<T> {
  const url = new URL(path, SCRYFALL_API_ORIGIN);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  const response = await fetch(url, {
    headers: SCRYFALL_HEADERS,
    next: { revalidate: 3_600 },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new ScryfallApiError(payload as ScryfallError);
  }

  return payload as T;
}

function assertScryfallId(value: string, label: string) {
  if (!SCRYFALL_ID_PATTERN.test(value)) {
    throw createNotFoundError(`The ${label} was not valid`);
  }
}

export async function getCardById(cardId: string): Promise<CardDetails> {
  assertScryfallId(cardId, "card identifier");

  const card = await requestScryfall<ScryfallCard>(`/cards/${cardId}`);

  return normalizeScryfallCardDetails(card);
}

export async function getCardPrintings(
  oracleId: string,
): Promise<CardDetails[]> {
  assertScryfallId(oracleId, "Oracle identifier");

  const searchParams = new URLSearchParams({
    q: `oracleid:${oracleId} game:paper`,
    unique: "prints",
    order: "released",
    dir: "desc",
  });
  const result = await requestScryfall<ScryfallList<ScryfallCard>>(
    "/cards/search",
    searchParams,
  );

  return result.data.map(normalizeScryfallCardDetails);
}

export async function getCardRulings(
  cardId: string,
): Promise<CardRuling[]> {
  assertScryfallId(cardId, "card identifier");

  const result = await requestScryfall<ScryfallList<ScryfallRuling>>(
    `/cards/${cardId}/rulings`,
  );

  return result.data.map((ruling, index) => ({
    id: `${ruling.oracle_id}:${ruling.published_at}:${index}`,
    publishedAt: ruling.published_at,
    source: ruling.source,
    comment: ruling.comment,
  }));
}

export async function getCardDetailsBundle(
  cardId: string,
): Promise<CardDetailsBundle> {
  const card = await getCardById(cardId);
  const [printings, rulings] = await Promise.all([
    getCardPrintings(card.oracleId),
    getCardRulings(card.id),
  ]);

  return { card, printings, rulings };
}

export async function autocompleteCardNames(
  query: string,
): Promise<string[]> {
  const normalizedQuery = query.trim().slice(0, 64);

  if (normalizedQuery.length < 2) {
    return [];
  }

  const result = await requestScryfall<ScryfallAutocomplete>(
    "/cards/autocomplete",
    new URLSearchParams({ q: normalizedQuery, include_extras: "false" }),
  );

  return result.data.slice(0, 8);
}
