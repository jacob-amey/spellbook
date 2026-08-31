import { describe, expect, it } from "vitest";

import {
  buildScryfallQuery,
  getActiveFilterLabels,
  parseExploreFilters,
} from "@/lib/card-filters";

describe("Explore card filters", () => {
  it("returns a random draw when no search choices are active", () => {
    const filters = parseExploreFilters({});

    expect(filters.sort).toBe("name");
    expect(buildScryfallQuery(filters)).toBe("");
    expect(getActiveFilterLabels(filters)).toEqual([]);
  });

  it("turns submitted controls into a Scryfall search", () => {
    const filters = parseExploreFilters({
      q: "o:flying",
      color: "blue",
      mv: "3",
      type: "creature",
      rarity: "rare",
      format: "commander",
      sort: "released",
    });

    expect(buildScryfallQuery(filters)).toBe(
      "o:flying c:blue mv=3 t:creature r:rare f:commander game:paper",
    );
    expect(getActiveFilterLabels(filters)).toEqual([
      "Search: “o:flying”",
      "Blue",
      "3",
      "Creature",
      "Rare",
      "Commander",
      "Sorted by Newest release",
    ]);
  });

  it("supports special range and multicolor filters", () => {
    const filters = parseExploreFilters({
      color: "multicolor",
      mv: "6-plus",
    });

    expect(buildScryfallQuery(filters)).toBe(
      "c>1 mv>=6 game:paper",
    );
  });

  it("uses a full paper search when only sorting is changed", () => {
    const filters = parseExploreFilters({ sort: "edhrec" });

    expect(buildScryfallQuery(filters)).toBe("game:paper");
    expect(getActiveFilterLabels(filters)).toEqual([
      "Sorted by Commander popularity",
    ]);
  });

  it("ignores unsupported or repeated URL values", () => {
    const filters = parseExploreFilters({
      q: ["one", "two"],
      color: "purple",
      mv: "999",
      type: "tribal",
      rarity: "premium",
      format: "future",
      sort: "random",
    });

    expect(filters).toEqual({
      query: "",
      color: "",
      manaValue: "",
      cardType: "",
      rarity: "",
      format: "",
      sort: "name",
    });
  });
});
