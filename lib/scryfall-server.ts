import "server-only";
import { cache } from "react";

import {
  normalizeScryfallCardDetails,
  readScryfallResponse,
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
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await readScryfallResponse(response);

  return payload as T;
}

function assertScryfallId(value: string, label: string) {
  if (!SCRYFALL_ID_PATTERN.test(value)) {
    throw createNotFoundError(`The ${label} was not valid`);
  }
}

export const getCardById = cache(async (cardId: string): Promise<CardDetails> => {
  assertScryfallId(cardId, "card identifier");

  const card = await requestScryfall<ScryfallCard>(`/cards/${cardId}`);

  return normalizeScryfallCardDetails(card);
});

export async function getCardPrintings(
  oracleId: string,
): Promise<NonNullable<CardDetailsBundle["printings"]>> {
  assertScryfallId(oracleId, "Oracle identifier");

  const searchParams = new URLSearchParams({
    q: `oracleid:${oracleId} game:paper`,
    unique: "prints",
    order: "released",
    dir: "desc",
  });
  try {
    const result = await requestScryfall<ScryfallList<ScryfallCard>>(
      "/cards/search",
      searchParams,
    );
    return { cards: result.data.map(normalizeScryfallCardDetails), totalCards: result.total_cards ?? result.data.length };
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404 && error.code === "not_found") {
      return { cards: [], totalCards: 0 };
    }
    throw error;
  }
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
  const [printings, rulings] = await Promise.allSettled([
    getCardPrintings(card.oracleId),
    getCardRulings(card.id),
  ]);

  return {
    card,
    printings: printings.status === "fulfilled" ? printings.value : null,
    rulings: rulings.status === "fulfilled" ? rulings.value : null,
  };
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

  if (!result || !Array.isArray(result.data)) {
    throw new ScryfallApiError({ details: "Card suggestions are temporarily unavailable." });
  }
  return [...new Set(result.data.filter((name): name is string => typeof name === "string" && name.trim().length > 0))].slice(0, 8);
}
