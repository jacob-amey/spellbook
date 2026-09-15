import { test as base, expect, type Page } from "@playwright/test";
import { createList, createScryfallCard } from "../tests/scryfall-fixtures";

export const blueCard = {
  ...createScryfallCard("00000000-0000-4000-8000-000000000001", "Demo Blue Drake"),
  oracle_id: "00000000-0000-4000-8000-000000000002",
  type_line: "Creature — Drake",
  mana_cost: "{2}{U}",
  cmc: 3,
  color_identity: ["U" as const],
  oracle_text: "Flying",
};
export const redCard = {
  ...createScryfallCard("00000000-0000-4000-8000-000000000003", "Demo Red Bolt"),
  oracle_id: "00000000-0000-4000-8000-000000000004",
  type_line: "Instant",
  mana_cost: "{R}",
  cmc: 1,
  color_identity: ["R" as const],
};

// Only the browser's external boundary is mocked. Routing, React state,
// persistence, forms, downloads and the production server all run for real.
export const test = base.extend<{ archive: void }>({
  archive: [async ({ page }, use) => {
    await page.route("https://api.scryfall.com/**", async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q") ?? "";
      if (query.includes("unfindable")) {
        await route.fulfill({ status: 404, json: { object: "error", status: 404, code: "not_found", details: "No cards found" } });
      } else if (query.includes("c>=U")) {
        await route.fulfill({ json: createList([blueCard]) });
      } else if (query.includes("Demo Red Bolt")) {
        await route.fulfill({ json: createList([redCard]) });
      } else {
        await route.fulfill({ json: createList([blueCard, redCard]) });
      }
    });
    await page.route("**/api/cards/autocomplete?*", (route) =>
      route.fulfill({ json: { suggestions: ["Demo Red Bolt"] } }),
    );
    await use();
  }, { auto: true }],
});

export { expect };

export async function openFilters(page: Page) {
  const toggle = page.getByRole("button", { name: /Search and filter cards/ });
  if (await toggle.isVisible()) await toggle.click();
}
