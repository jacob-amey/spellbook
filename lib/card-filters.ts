import type { ScryfallSortOrder } from "@/lib/scryfall";

type FilterOption = {
  value: string;
  label: string;
  query: string;
};

type SortOption = {
  value: ScryfallSortOrder;
  label: string;
};

export const COLOR_OPTIONS: FilterOption[] = [
  { value: "", label: "Any color", query: "" },
  { value: "white", label: "White", query: "c:white" },
  { value: "blue", label: "Blue", query: "c:blue" },
  { value: "black", label: "Black", query: "c:black" },
  { value: "red", label: "Red", query: "c:red" },
  { value: "green", label: "Green", query: "c:green" },
  { value: "colorless", label: "Colorless", query: "c:colorless" },
  { value: "multicolor", label: "Multicolor", query: "c>1" },
];

export const MANA_VALUE_OPTIONS: FilterOption[] = [
  { value: "", label: "Any mana value", query: "" },
  { value: "0", label: "0", query: "mv=0" },
  { value: "1", label: "1", query: "mv=1" },
  { value: "2", label: "2", query: "mv=2" },
  { value: "3", label: "3", query: "mv=3" },
  { value: "4", label: "4", query: "mv=4" },
  { value: "5", label: "5", query: "mv=5" },
  { value: "6-plus", label: "6 or more", query: "mv>=6" },
];

export const CARD_TYPE_OPTIONS: FilterOption[] = [
  { value: "", label: "Any card type", query: "" },
  { value: "creature", label: "Creature", query: "t:creature" },
  { value: "instant", label: "Instant", query: "t:instant" },
  { value: "sorcery", label: "Sorcery", query: "t:sorcery" },
  { value: "artifact", label: "Artifact", query: "t:artifact" },
  { value: "enchantment", label: "Enchantment", query: "t:enchantment" },
  { value: "planeswalker", label: "Planeswalker", query: "t:planeswalker" },
  { value: "land", label: "Land", query: "t:land" },
  { value: "battle", label: "Battle", query: "t:battle" },
];

export const RARITY_OPTIONS: FilterOption[] = [
  { value: "", label: "Any rarity", query: "" },
  { value: "common", label: "Common", query: "r:common" },
  { value: "uncommon", label: "Uncommon", query: "r:uncommon" },
  { value: "rare", label: "Rare", query: "r:rare" },
  { value: "mythic", label: "Mythic rare", query: "r:mythic" },
];

export const FORMAT_OPTIONS: FilterOption[] = [
  { value: "", label: "Any format", query: "" },
  { value: "standard", label: "Standard", query: "f:standard" },
  { value: "pioneer", label: "Pioneer", query: "f:pioneer" },
  { value: "modern", label: "Modern", query: "f:modern" },
  { value: "legacy", label: "Legacy", query: "f:legacy" },
  { value: "commander", label: "Commander", query: "f:commander" },
  { value: "pauper", label: "Pauper", query: "f:pauper" },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Card name" },
  { value: "released", label: "Newest release" },
  { value: "cmc", label: "Mana value" },
  { value: "rarity", label: "Rarity" },
  { value: "color", label: "Color" },
  { value: "usd", label: "USD price" },
  { value: "edhrec", label: "Commander popularity" },
];

export type ExploreFilters = {
  query: string;
  color: string;
  manaValue: string;
  cardType: string;
  rarity: string;
  format: string;
  sort: ScryfallSortOrder;
};

export type SearchParamRecord = Record<
  string,
  string | string[] | undefined
>;

function readSingleValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOption(
  value: string,
  options: readonly { value: string }[],
): string {
  return options.some((option) => option.value === value) ? value : "";
}

export function parseExploreFilters(
  searchParams: SearchParamRecord,
): ExploreFilters {
  const submittedSort = readSingleValue(searchParams.sort);
  const sort = SORT_OPTIONS.some((option) => option.value === submittedSort)
    ? (submittedSort as ScryfallSortOrder)
    : "name";

  return {
    query: readSingleValue(searchParams.q),
    color: normalizeOption(
      readSingleValue(searchParams.color),
      COLOR_OPTIONS,
    ),
    manaValue: normalizeOption(
      readSingleValue(searchParams.mv),
      MANA_VALUE_OPTIONS,
    ),
    cardType: normalizeOption(
      readSingleValue(searchParams.type),
      CARD_TYPE_OPTIONS,
    ),
    rarity: normalizeOption(
      readSingleValue(searchParams.rarity),
      RARITY_OPTIONS,
    ),
    format: normalizeOption(
      readSingleValue(searchParams.format),
      FORMAT_OPTIONS,
    ),
    sort,
  };
}

function findFilterOption(
  value: string,
  options: FilterOption[],
): FilterOption | undefined {
  return options.find((option) => option.value === value && option.query);
}

export function buildScryfallQuery(filters: ExploreFilters): string {
  const filterQueries = [
    findFilterOption(filters.color, COLOR_OPTIONS)?.query,
    findFilterOption(filters.manaValue, MANA_VALUE_OPTIONS)?.query,
    findFilterOption(filters.cardType, CARD_TYPE_OPTIONS)?.query,
    findFilterOption(filters.rarity, RARITY_OPTIONS)?.query,
    findFilterOption(filters.format, FORMAT_OPTIONS)?.query,
  ].filter((value): value is string => Boolean(value));

  const parts = [filters.query, ...filterQueries].filter(Boolean);

  if (parts.length === 0 && filters.sort === "name") {
    return "";
  }

  return [...parts, "game:paper"].join(" ");
}

export function getActiveFilterLabels(filters: ExploreFilters): string[] {
  const labels = [
    filters.query ? `Search: “${filters.query}”` : "",
    findFilterOption(filters.color, COLOR_OPTIONS)?.label,
    findFilterOption(filters.manaValue, MANA_VALUE_OPTIONS)?.label,
    findFilterOption(filters.cardType, CARD_TYPE_OPTIONS)?.label,
    findFilterOption(filters.rarity, RARITY_OPTIONS)?.label,
    findFilterOption(filters.format, FORMAT_OPTIONS)?.label,
    filters.sort !== "name"
      ? `Sorted by ${
          SORT_OPTIONS.find((option) => option.value === filters.sort)?.label
        }`
      : "",
  ].filter((value): value is string => Boolean(value));

  return labels;
}
