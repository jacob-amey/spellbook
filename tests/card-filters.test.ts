import { describe, expect, it } from "vitest";

import {
  buildScryfallQuery,
  getActiveFilterLabels,
  getQueryExplanations,
  parseExploreFilters,
} from "@/lib/card-filters";

describe("Explore card filters", () => {
  it("returns a random draw when no search choices are active", () => {
    const filters = parseExploreFilters({});

    expect(filters.sort).toBe("name");
    expect(filters.view).toBe("grid");
    expect(filters.unique).toBe("cards");
    expect(buildScryfallQuery(filters)).toBe("");
    expect(getActiveFilterLabels(filters)).toEqual([]);
  });

  it("turns common controls into an exact Scryfall search", () => {
    const filters = parseExploreFilters({
      q: "angel",
      color: ["W", "U"],
      colorMode: "identity",
      mvMin: "3",
      mvMax: "6",
      type: "creature",
      rarity: "rare",
      format: "commander",
      sort: "released",
      view: "detail",
    });

    expect(buildScryfallQuery(filters)).toBe(
      "angel id<=WU mv>=3 mv<=6 t:creature r:rare f:commander game:paper",
    );
    expect(getActiveFilterLabels(filters)).toEqual([
      "Search: “angel”",
      "Fits this Commander identity: WU",
      "Mana value 3–6",
      "Creature",
      "Rare",
      "Commander",
      "Sorted by Newest release",
    ]);
  });

  it("supports research filters, ranges, and every printing", () => {
    const filters = parseExploreFilters({
      colorless: "true",
      mvMin: "4",
      mvMax: "4",
      subtype: "Equipment",
      oracle: "draw a card",
      keyword: "first strike",
      set: "MKM",
      artist: "Rebecca Guay",
      priceMin: "0.5",
      priceMax: "10",
      releasedAfter: "2000-01-01",
      releasedBefore: "2026-12-31",
      unique: "prints",
      view: "compact",
    });

    expect(buildScryfallQuery(filters)).toBe(
      'c=c mv=4 t:"Equipment" o:"draw a card" keyword:first-strike set:mkm a:"Rebecca Guay" usd>=0.5 usd<=10 date>=2000-01-01 date<=2026-12-31 game:paper',
    );
    expect(filters.unique).toBe("prints");
    expect(filters.view).toBe("compact");
    expect(getQueryExplanations(filters).map(({ label }) => label)).toEqual([
      "Color relationship",
      "Mana value",
      "Subtype",
      "Oracle text",
      "Keyword",
      "Set",
      "Artist",
      "Minimum price",
      "Maximum price",
      "Released after",
      "Released before",
      "Paper cards",
    ]);
  });

  it("uses a full paper search when only sorting is changed", () => {
    const filters = parseExploreFilters({ sort: "edhrec" });

    expect(buildScryfallQuery(filters)).toBe("game:paper");
    expect(getActiveFilterLabels(filters)).toEqual([
      "Sorted by Commander popularity",
    ]);
  });

  it("normalizes unsupported, unsafe, or out-of-range URL values", () => {
    const filters = parseExploreFilters({
      q: ["one", "two"],
      color: ["W", "purple", "W"],
      colorMode: "exclude",
      mvMin: "-1",
      mvMax: "999",
      type: "tribal",
      rarity: "premium",
      format: "future",
      set: "not a set",
      priceMin: "free",
      releasedAfter: "yesterday",
      unique: "art",
      view: "poster",
      sort: "random",
    });

    expect(filters).toEqual({
      query: "",
      colors: ["W"],
      colorless: false,
      colorMode: "include",
      manaMin: "",
      manaMax: "",
      cardType: "",
      subtype: "",
      oracleText: "",
      keyword: "",
      setCode: "",
      rarity: "",
      format: "",
      artist: "",
      priceMin: "",
      priceMax: "",
      releasedAfter: "",
      releasedBefore: "",
      unique: "cards",
      view: "grid",
      sort: "name",
    });
  });

  it("sanitizes quoted filter values before building a query", () => {
    const filters = parseExploreFilters({
      oracle: 'when "this" \\ happens',
    });

    expect(buildScryfallQuery(filters)).toBe(
      'o:"when this happens" game:paper',
    );
  });

  it("supports exact and inclusive color matching", () => {
    const exact = parseExploreFilters({ color: ["B", "R"], colorMode: "exact" });
    const inclusive = parseExploreFilters({ color: "G" });

    expect(buildScryfallQuery(exact)).toBe("c=BR game:paper");
    expect(buildScryfallQuery(inclusive)).toBe("c>=G game:paper");
    expect(getQueryExplanations(exact)[0].description).toContain("exactly");
    expect(getQueryExplanations(inclusive)[0].description).toContain("may include others");
  });

  it("explains a direct query and omits explanations for a random draw", () => {
    const searched = parseExploreFilters({ q: "pow>=5" });
    const random = parseExploreFilters({});

    expect(getQueryExplanations(searched)[0]).toMatchObject({
      token: "pow>=5",
      label: "Your search",
    });
    expect(getQueryExplanations(random)).toEqual([]);
  });
});
