import type {
  ScryfallSortOrder,
  ScryfallUniqueMode,
} from "@/lib/scryfall";
import type { ScryfallColor } from "@/types/scryfall";

type FilterOption = {
  value: string;
  label: string;
  query: string;
};

type SortOption = {
  value: ScryfallSortOrder;
  label: string;
};

export const COLOR_OPTIONS: Array<{
  value: ScryfallColor;
  label: string;
  shortLabel: string;
}> = [
  { value: "W", label: "White", shortLabel: "W" },
  { value: "U", label: "Blue", shortLabel: "U" },
  { value: "B", label: "Black", shortLabel: "B" },
  { value: "R", label: "Red", shortLabel: "R" },
  { value: "G", label: "Green", shortLabel: "G" },
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
  { value: "legendary", label: "Legendary", query: "t:legendary" },
];

export const RARITY_OPTIONS: FilterOption[] = [
  { value: "", label: "Any rarity", query: "" },
  { value: "common", label: "Common", query: "r:common" },
  { value: "uncommon", label: "Uncommon", query: "r:uncommon" },
  { value: "rare", label: "Rare", query: "r:rare" },
  { value: "mythic", label: "Mythic rare", query: "r:mythic" },
  { value: "special", label: "Special", query: "r:special" },
  { value: "bonus", label: "Bonus", query: "r:bonus" },
];

export const FORMAT_OPTIONS: FilterOption[] = [
  { value: "", label: "Any format", query: "" },
  { value: "standard", label: "Standard", query: "f:standard" },
  { value: "pioneer", label: "Pioneer", query: "f:pioneer" },
  { value: "modern", label: "Modern", query: "f:modern" },
  { value: "legacy", label: "Legacy", query: "f:legacy" },
  { value: "vintage", label: "Vintage", query: "f:vintage" },
  { value: "commander", label: "Commander", query: "f:commander" },
  { value: "pauper", label: "Pauper", query: "f:pauper" },
  { value: "brawl", label: "Brawl", query: "f:brawl" },
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

export const COLOR_MATCH_OPTIONS = [
  { value: "include", label: "Includes these colors" },
  { value: "exact", label: "Exactly these colors" },
  { value: "identity", label: "Fits this Commander identity" },
] as const;

export const RESULT_VIEW_OPTIONS = [
  { value: "grid", label: "Gallery" },
  { value: "detail", label: "Detail" },
  { value: "compact", label: "Compact" },
] as const;

export const UNIQUE_OPTIONS = [
  { value: "cards", label: "One result per card" },
  { value: "prints", label: "Show every printing" },
] as const;

export type ColorMatchMode =
  (typeof COLOR_MATCH_OPTIONS)[number]["value"];
export type ResultView =
  (typeof RESULT_VIEW_OPTIONS)[number]["value"];

export type ExploreFilters = {
  query: string;
  colors: ScryfallColor[];
  colorless: boolean;
  colorMode: ColorMatchMode;
  manaMin: string;
  manaMax: string;
  cardType: string;
  subtype: string;
  oracleText: string;
  keyword: string;
  setCode: string;
  rarity: string;
  format: string;
  artist: string;
  priceMin: string;
  priceMax: string;
  releasedAfter: string;
  releasedBefore: string;
  unique: ScryfallUniqueMode;
  view: ResultView;
  sort: ScryfallSortOrder;
};

export type SearchParamRecord = Record<
  string,
  string | string[] | undefined
>;

export type QueryExplanation = {
  token: string;
  label: string;
  description: string;
};

function readSingleValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function readMultipleValues(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

function normalizeOption<T extends string>(
  value: string,
  options: readonly { value: T }[],
  fallback: T,
): T {
  return options.some((option) => option.value === value)
    ? (value as T)
    : fallback;
}

function normalizeNumber(value: string, maximum = 1_000_000): string {
  if (!value) {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 && number <= maximum
    ? String(number)
    : "";
}

function normalizeDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    ? value
    : "";
}

function normalizeSetCode(value: string): string {
  return /^[a-z0-9]{2,8}$/i.test(value) ? value.toLowerCase() : "";
}

function normalizeSearchText(value: string, maximum = 120): string {
  return value.slice(0, maximum).trim();
}

function quoteQueryValue(value: string): string {
  return `"${value.replace(/["\\]/g, " ").replace(/\s+/g, " ").trim()}"`;
}

function findFilterOption(
  value: string,
  options: FilterOption[],
): FilterOption | undefined {
  return options.find((option) => option.value === value && option.query);
}

export function parseExploreFilters(
  searchParams: SearchParamRecord,
): ExploreFilters {
  const colors = readMultipleValues(searchParams.color).filter(
    (value): value is ScryfallColor =>
      COLOR_OPTIONS.some((option) => option.value === value),
  );

  return {
    query: normalizeSearchText(readSingleValue(searchParams.q), 300),
    colors: Array.from(new Set(colors)),
    colorless: readSingleValue(searchParams.colorless) === "true",
    colorMode: normalizeOption(
      readSingleValue(searchParams.colorMode),
      COLOR_MATCH_OPTIONS,
      "include",
    ),
    manaMin: normalizeNumber(readSingleValue(searchParams.mvMin), 30),
    manaMax: normalizeNumber(readSingleValue(searchParams.mvMax), 30),
    cardType: normalizeOption(
      readSingleValue(searchParams.type),
      CARD_TYPE_OPTIONS,
      "",
    ),
    subtype: normalizeSearchText(readSingleValue(searchParams.subtype), 80),
    oracleText: normalizeSearchText(readSingleValue(searchParams.oracle), 200),
    keyword: normalizeSearchText(readSingleValue(searchParams.keyword), 80),
    setCode: normalizeSetCode(readSingleValue(searchParams.set)),
    rarity: normalizeOption(
      readSingleValue(searchParams.rarity),
      RARITY_OPTIONS,
      "",
    ),
    format: normalizeOption(
      readSingleValue(searchParams.format),
      FORMAT_OPTIONS,
      "",
    ),
    artist: normalizeSearchText(readSingleValue(searchParams.artist), 100),
    priceMin: normalizeNumber(readSingleValue(searchParams.priceMin)),
    priceMax: normalizeNumber(readSingleValue(searchParams.priceMax)),
    releasedAfter: normalizeDate(readSingleValue(searchParams.releasedAfter)),
    releasedBefore: normalizeDate(readSingleValue(searchParams.releasedBefore)),
    unique: normalizeOption(
      readSingleValue(searchParams.unique),
      UNIQUE_OPTIONS,
      "cards",
    ),
    view: normalizeOption(
      readSingleValue(searchParams.view),
      RESULT_VIEW_OPTIONS,
      "grid",
    ),
    sort: normalizeOption(
      readSingleValue(searchParams.sort),
      SORT_OPTIONS,
      "name",
    ),
  };
}

function getColorQuery(filters: ExploreFilters): string {
  if (filters.colorless) {
    return "c=c";
  }

  if (filters.colors.length === 0) {
    return "";
  }

  const colorCode = filters.colors.join("");

  if (filters.colorMode === "exact") {
    return `c=${colorCode}`;
  }

  if (filters.colorMode === "identity") {
    return `id<=${colorCode}`;
  }

  return `c>=${colorCode}`;
}

function getManaValueQueries(filters: ExploreFilters): string[] {
  if (
    filters.manaMin &&
    filters.manaMax &&
    filters.manaMin === filters.manaMax
  ) {
    return [`mv=${filters.manaMin}`];
  }

  return [
    filters.manaMin ? `mv>=${filters.manaMin}` : "",
    filters.manaMax ? `mv<=${filters.manaMax}` : "",
  ].filter(Boolean);
}

export function buildScryfallQuery(filters: ExploreFilters): string {
  const filterQueries = [
    getColorQuery(filters),
    ...getManaValueQueries(filters),
    findFilterOption(filters.cardType, CARD_TYPE_OPTIONS)?.query ?? "",
    filters.subtype ? `t:${quoteQueryValue(filters.subtype)}` : "",
    filters.oracleText ? `o:${quoteQueryValue(filters.oracleText)}` : "",
    filters.keyword
      ? `keyword:${filters.keyword.toLowerCase().replace(/\s+/g, "-")}`
      : "",
    filters.setCode ? `set:${filters.setCode}` : "",
    findFilterOption(filters.rarity, RARITY_OPTIONS)?.query ?? "",
    findFilterOption(filters.format, FORMAT_OPTIONS)?.query ?? "",
    filters.artist ? `a:${quoteQueryValue(filters.artist)}` : "",
    filters.priceMin ? `usd>=${filters.priceMin}` : "",
    filters.priceMax ? `usd<=${filters.priceMax}` : "",
    filters.releasedAfter ? `date>=${filters.releasedAfter}` : "",
    filters.releasedBefore ? `date<=${filters.releasedBefore}` : "",
  ].filter(Boolean);

  const parts = [filters.query, ...filterQueries].filter(Boolean);

  if (parts.length === 0 && filters.sort === "name") {
    return "";
  }

  return [...parts, "game:paper"].join(" ");
}

export function getActiveFilterLabels(filters: ExploreFilters): string[] {
  const colorLabel = filters.colorless
    ? "Colorless only"
    : filters.colors.length > 0
      ? `${
          COLOR_MATCH_OPTIONS.find(
            (option) => option.value === filters.colorMode,
          )?.label
        }: ${filters.colors.join("")}`
      : "";
  const manaLabel =
    filters.manaMin || filters.manaMax
      ? `Mana value ${filters.manaMin || "0"}–${filters.manaMax || "∞"}`
      : "";

  return [
    filters.query ? `Search: “${filters.query}”` : "",
    colorLabel,
    manaLabel,
    findFilterOption(filters.cardType, CARD_TYPE_OPTIONS)?.label ?? "",
    filters.subtype ? `Subtype: ${filters.subtype}` : "",
    filters.oracleText ? `Rules: “${filters.oracleText}”` : "",
    filters.keyword ? `Keyword: ${filters.keyword}` : "",
    filters.setCode ? `Set: ${filters.setCode.toUpperCase()}` : "",
    findFilterOption(filters.rarity, RARITY_OPTIONS)?.label ?? "",
    findFilterOption(filters.format, FORMAT_OPTIONS)?.label ?? "",
    filters.artist ? `Artist: ${filters.artist}` : "",
    filters.priceMin || filters.priceMax
      ? `USD $${filters.priceMin || "0"}–$${filters.priceMax || "∞"}`
      : "",
    filters.releasedAfter || filters.releasedBefore
      ? `Released ${filters.releasedAfter || "beginning"}–${filters.releasedBefore || "today"}`
      : "",
    filters.unique === "prints" ? "Every printing" : "",
    filters.sort !== "name"
      ? `Sorted by ${
          SORT_OPTIONS.find((option) => option.value === filters.sort)?.label
        }`
      : "",
  ].filter(Boolean);
}

export function getQueryExplanations(
  filters: ExploreFilters,
): QueryExplanation[] {
  const query = buildScryfallQuery(filters);

  if (!query) {
    return [];
  }

  const explanations: QueryExplanation[] = [];

  if (filters.query) {
    explanations.push({
      token: filters.query,
      label: "Your search",
      description: "Passed through as a card name, rules term, or advanced Scryfall expression.",
    });
  }

  const colorQuery = getColorQuery(filters);

  if (colorQuery) {
    explanations.push({
      token: colorQuery,
      label: "Color relationship",
      description:
        filters.colorMode === "identity"
          ? "Only cards whose Commander color identity fits within the selected colors."
          : filters.colorMode === "exact"
            ? "Only cards with exactly the selected colors."
            : "Cards must include every selected color and may include others.",
    });
  }

  for (const token of getManaValueQueries(filters)) {
    explanations.push({
      token,
      label: "Mana value",
      description: "Limits the total mana value needed to cast the card.",
    });
  }

  const descriptiveTokens: Array<[string, string, string]> = [
    [
      findFilterOption(filters.cardType, CARD_TYPE_OPTIONS)?.query ?? "",
      "Card type",
      "Matches text on the card's type line.",
    ],
    [
      filters.subtype ? `t:${quoteQueryValue(filters.subtype)}` : "",
      "Subtype",
      "Matches a specific creature, artifact, or other subtype.",
    ],
    [
      filters.oracleText ? `o:${quoteQueryValue(filters.oracleText)}` : "",
      "Oracle text",
      "Searches the card's current official rules text.",
    ],
    [
      filters.keyword
        ? `keyword:${filters.keyword.toLowerCase().replace(/\s+/g, "-")}`
        : "",
      "Keyword",
      "Matches a named Magic keyword or mechanic.",
    ],
    [
      filters.setCode ? `set:${filters.setCode}` : "",
      "Set",
      "Limits results to one expansion or product set.",
    ],
    [
      findFilterOption(filters.rarity, RARITY_OPTIONS)?.query ?? "",
      "Rarity",
      "Limits results by printing rarity.",
    ],
    [
      findFilterOption(filters.format, FORMAT_OPTIONS)?.query ?? "",
      "Format",
      "Only returns cards currently legal in this format.",
    ],
    [
      filters.artist ? `a:${quoteQueryValue(filters.artist)}` : "",
      "Artist",
      "Matches the credited card artist.",
    ],
    [
      filters.priceMin ? `usd>=${filters.priceMin}` : "",
      "Minimum price",
      "Uses Scryfall's current nonfoil USD estimate.",
    ],
    [
      filters.priceMax ? `usd<=${filters.priceMax}` : "",
      "Maximum price",
      "Uses Scryfall's current nonfoil USD estimate.",
    ],
    [
      filters.releasedAfter ? `date>=${filters.releasedAfter}` : "",
      "Released after",
      "Limits results by the printing's release date.",
    ],
    [
      filters.releasedBefore ? `date<=${filters.releasedBefore}` : "",
      "Released before",
      "Limits results by the printing's release date.",
    ],
  ];

  for (const [token, label, description] of descriptiveTokens) {
    if (token) {
      explanations.push({ token, label, description });
    }
  }

  explanations.push({
    token: "game:paper",
    label: "Paper cards",
    description: "Excludes digital-only Arena and Magic Online cards.",
  });

  return explanations;
}
