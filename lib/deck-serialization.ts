import type { Card } from "@/types/card";
import {
  type Deck,
  type DeckEntry,
  type DeckZone,
} from "@/types/deck";
import type {
  ScryfallColor,
  ScryfallLegality,
} from "@/types/scryfall";
import {
  MAX_CARD_QUANTITY,
  formatDeckZone,
  isDeckFormat,
  isDeckZone,
} from "@/lib/deck-operations";

export const DECK_STORAGE_VERSION = 1;
export const MAX_DECK_IMPORT_SIZE = 2_000_000;

const MAX_DECK_ENTRIES = 1_000;
const SCRYFALL_CARD_ORIGIN = "https://scryfall.com";
const SCRYFALL_IMAGE_ORIGIN = "https://cards.scryfall.io";

const COLORS: ScryfallColor[] = ["W", "U", "B", "R", "G"];
const LEGALITIES: ScryfallLegality[] = [
  "legal",
  "not_legal",
  "restricted",
  "banned",
];

type ImportResult =
  | { ok: true; deck: Deck }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonemptyString(value: unknown, maxLength = 5_000) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isNullableString(value: unknown, maxLength = 5_000) {
  return value === null || (typeof value === "string" && value.length <= maxLength);
}

function isValidDate(value: unknown) {
  return (
    typeof value === "string" &&
    value.length <= 50 &&
    !Number.isNaN(Date.parse(value))
  );
}

function isTrustedUrl(
  value: unknown,
  origin: string,
  pathnamePrefix: string,
) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.origin === origin &&
      url.pathname.startsWith(pathnamePrefix)
    );
  } catch {
    return false;
  }
}

function parseLegalities(
  value: unknown,
): Record<string, ScryfallLegality> | null {
  if (!isRecord(value)) {
    return null;
  }

  const legalities: Record<string, ScryfallLegality> = {};

  for (const [format, legality] of Object.entries(value)) {
    if (
      !format ||
      format.length > 50 ||
      !LEGALITIES.some((candidate) => candidate === legality)
    ) {
      return null;
    }

    legalities[format] = legality as ScryfallLegality;
  }

  return legalities;
}

function parseCard(value: unknown): Card | null {
  if (!isRecord(value)) {
    return null;
  }

  const requiredStrings = [
    "id",
    "oracleId",
    "name",
    "setCode",
    "setName",
    "collectorNumber",
    "releasedAt",
    "typeLine",
    "scryfallUrl",
  ] as const;

  if (
    !requiredStrings.every((key) =>
      isNonemptyString(value[key], 5_000),
    ) ||
    !isValidDate(value.releasedAt) ||
    typeof value.manaCost !== "string" ||
    value.manaCost.length > 5_000 ||
    typeof value.oracleText !== "string" ||
    value.oracleText.length > 50_000 ||
    typeof value.manaValue !== "number" ||
    !Number.isFinite(value.manaValue) ||
    value.manaValue < 0 ||
    !isNullableString(value.power, 100) ||
    !isNullableString(value.toughness, 100) ||
    !isNullableString(value.priceUsd, 100) ||
    !isNullableString(value.artist, 1_000) ||
    !Array.isArray(value.keywords) ||
    !value.keywords.every((keyword) => isNonemptyString(keyword, 500)) ||
    !Array.isArray(value.colorIdentity) ||
    !value.colorIdentity.every((color) =>
      COLORS.some((candidate) => candidate === color),
    ) ||
    !isTrustedUrl(value.scryfallUrl, SCRYFALL_CARD_ORIGIN, "/card/")
  ) {
    return null;
  }

  const legalities = parseLegalities(value.legalities);

  if (!legalities) {
    return null;
  }

  if (
    value.imageUrl !== null &&
    !isTrustedUrl(
      value.imageUrl,
      SCRYFALL_IMAGE_ORIGIN,
      "/normal/",
    )
  ) {
    return null;
  }

  return {
    id: value.id as string,
    oracleId: value.oracleId as string,
    name: value.name as string,
    setCode: value.setCode as string,
    setName: value.setName as string,
    collectorNumber: value.collectorNumber as string,
    releasedAt: value.releasedAt as string,
    manaCost: value.manaCost as string,
    manaValue: value.manaValue,
    typeLine: value.typeLine as string,
    oracleText: value.oracleText as string,
    power: value.power as string | null,
    toughness: value.toughness as string | null,
    keywords: [...(value.keywords as string[])],
    colorIdentity: [...(value.colorIdentity as ScryfallColor[])],
    legalities,
    imageUrl: value.imageUrl as string | null,
    priceUsd: value.priceUsd as string | null,
    artist: value.artist as string | null,
    scryfallUrl: value.scryfallUrl as string,
  };
}

function parseDeckEntry(value: unknown): DeckEntry | null {
  if (
    !isRecord(value) ||
    typeof value.quantity !== "number" ||
    !Number.isSafeInteger(value.quantity) ||
    value.quantity < 1 ||
    value.quantity > MAX_CARD_QUANTITY ||
    !isDeckZone(value.zone)
  ) {
    return null;
  }

  const card = parseCard(value.card);

  if (!card) {
    return null;
  }

  return {
    card,
    quantity: value.quantity,
    zone: value.zone,
  };
}

export function parseDeckValue(value: unknown): Deck | null {
  if (
    !isRecord(value) ||
    !isNonemptyString(value.id, 200) ||
    !isNonemptyString(value.name, 60) ||
    !isDeckFormat(value.format) ||
    !isValidDate(value.createdAt) ||
    !isValidDate(value.updatedAt) ||
    !Array.isArray(value.cards) ||
    value.cards.length > MAX_DECK_ENTRIES
  ) {
    return null;
  }

  const mergedEntries = new Map<string, DeckEntry>();

  for (const sourceEntry of value.cards) {
    const entry = parseDeckEntry(sourceEntry);

    if (!entry) {
      return null;
    }

    const key = `${entry.card.oracleId}:${entry.zone}`;
    const existingEntry = mergedEntries.get(key);

    if (!existingEntry) {
      mergedEntries.set(key, entry);
      continue;
    }

    const quantity = existingEntry.quantity + entry.quantity;

    if (quantity > MAX_CARD_QUANTITY) {
      return null;
    }

    mergedEntries.set(key, {
      ...existingEntry,
      quantity,
    });
  }

  return {
    id: value.id as string,
    name: (value.name as string).trim(),
    format: value.format,
    cards: Array.from(mergedEntries.values()),
    createdAt: value.createdAt as string,
    updatedAt: value.updatedAt as string,
  };
}

export function parseStoredDecks(source: string | null): Deck[] {
  if (!source) {
    return [];
  }

  try {
    const value: unknown = JSON.parse(source);

    if (
      !isRecord(value) ||
      value.version !== DECK_STORAGE_VERSION ||
      !Array.isArray(value.decks)
    ) {
      return [];
    }

    return value.decks
      .map(parseDeckValue)
      .filter((deck): deck is Deck => deck !== null);
  } catch {
    return [];
  }
}

export function serializeStoredDecks(decks: Deck[]): string {
  return JSON.stringify({
    version: DECK_STORAGE_VERSION,
    decks,
  });
}

export function serializeDeckExport(deck: Deck): string {
  return JSON.stringify(
    {
      schema: "spellbook.deck",
      version: DECK_STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      deck,
    },
    null,
    2,
  );
}

export function parseDeckImport(source: string): ImportResult {
  if (!source.trim()) {
    return { ok: false, error: "Choose a nonempty Spellbook JSON file." };
  }

  if (source.length > MAX_DECK_IMPORT_SIZE) {
    return { ok: false, error: "That deck file is larger than 2 MB." };
  }

  try {
    const value: unknown = JSON.parse(source);

    if (
      !isRecord(value) ||
      value.schema !== "spellbook.deck" ||
      value.version !== DECK_STORAGE_VERSION ||
      !isValidDate(value.exportedAt)
    ) {
      return {
        ok: false,
        error: "This is not a supported Spellbook deck export.",
      };
    }

    const deck = parseDeckValue(value.deck);

    if (!deck) {
      return {
        ok: false,
        error: "The deck file contains invalid or unsafe card data.",
      };
    }

    return { ok: true, deck };
  } catch {
    return { ok: false, error: "The selected file is not valid JSON." };
  }
}

export function serializeDeckText(deck: Deck): string {
  const zones: DeckZone[] = ["commander", "mainboard", "sideboard"];
  const lines = [`${deck.name} (${deck.format})`, ""];

  for (const zone of zones) {
    const entries = deck.cards
      .filter((entry) => entry.zone === zone)
      .sort((first, second) =>
        first.card.name.localeCompare(second.card.name),
      );

    if (entries.length === 0) {
      continue;
    }

    lines.push(`${formatDeckZone(zone)}:`);

    for (const entry of entries) {
      lines.push(`${entry.quantity} ${entry.card.name}`);
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function createDeckFileName(name: string, extension: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${slug || "spellbook-deck"}.${extension}`;
}
