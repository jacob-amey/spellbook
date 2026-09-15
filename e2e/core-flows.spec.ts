import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { test, expect, openFilters } from "./fixtures";

test("choice filters apply immediately, typed queries debounce, and clear resets controls", async ({ page }) => {
  await page.goto("/explore");
  await openFilters(page);
  await page.getByTitle("Blue", { exact: true }).click();
  await expect(page).toHaveURL(/color=U/);
  await expect(page.getByRole("heading", { name: "Demo Blue Drake", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Demo Red Bolt", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Load another sample" })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Rarity", exact: true }).selectOption("rare");
  await expect(page).toHaveURL(/rarity=rare/);
  await page.getByRole("searchbox", { name: "Name, rules text, or syntax" }).fill("unfindable");
  await expect(page.getByRole("heading", { name: "No cards found" })).toBeVisible();
  await page.getByRole("link", { name: "Clear all", exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await openFilters(page);
  await expect(page.getByRole("checkbox", { name: "Blue", exact: true })).not.toBeChecked();
  await expect(page.getByRole("searchbox", { name: "Name, rules text, or syntax" })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Load another sample" })).toBeVisible();
});

test("keyboard autocomplete submits the chosen card", async ({ page }) => {
  await page.goto("/");
  const search = page.locator("#home-card-search");
  await search.fill("Demo");
  await expect(page.getByRole("listbox")).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=Demo%20Red%20Bolt/);
  await expect(page.getByRole("heading", { name: "Demo Red Bolt", exact: true })).toBeVisible();
});

test("the homepage search button opens a shareable result URL", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("search").filter({ has: page.locator("#home-card-search") });
  await search.getByRole("combobox").fill("Demo Red Bolt");
  await search.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/explore" && url.searchParams.get("q") === "Demo Red Bolt");
  await expect(page.getByRole("heading", { name: "Demo Red Bolt", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Demo Red Bolt", exact: true })).toBeVisible();
});

test("a deck survives search, quantity edits, reload, and JSON export/import", async ({ page }) => {
  await page.goto("/decks");
  await page.getByRole("textbox", { name: "Deck name", exact: true }).fill("Interview deck");
  await page.getByRole("combobox", { name: "Format", exact: true }).selectOption("casual");
  await page.getByRole("button", { name: "Create deck" }).click();
  await expect(page).toHaveURL(/\/decks\/[\w-]+$/);
  const deckUrl = page.url();
  await page.getByRole("link", { name: "Search cards", exact: true }).click();
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Demo Blue Drake", exact: true }) });
  await card.getByRole("button", { name: "Add", exact: true }).click();
  await page.goto(deckUrl);
  await page.getByRole("button", { name: "Increase Demo Blue Drake quantity" }).click();
  await page.reload();
  await expect(page.getByText("2 total cards across all sections", { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const content = await readFile(path!, "utf8");
  expect(content).toContain("Interview deck");
  expect(content).toContain("Demo Blue Drake");
  await page.getByRole("link", { name: "← All decks", exact: true }).click();
  await page.getByLabel("Import JSON").setInputFiles({ name: "deck.json", mimeType: "application/json", buffer: Buffer.from(content) });
  await expect(page.getByRole("heading", { name: "Interview deck", exact: true })).toHaveCount(2);
});

test("search errors provide a working retry", async ({ page }) => {
  let attempts = 0;
  await page.route("https://api.scryfall.com/**", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, json: { object: "error", status: 503, code: "unavailable", details: "Please retry." } });
    } else {
      await route.fallback();
    }
  });
  await page.goto("/explore?q=Demo");
  await expect(page.getByRole("heading", { name: "Card search is unavailable" })).toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Demo Blue Drake", exact: true })).toBeVisible();
});

test("a reviewer can open the sample deck without an API or account", async ({ page }) => {
  await page.goto("/decks");
  await page.getByRole("button", { name: "Try a sample deck" }).click();
  await expect(page.getByRole("textbox", { name: "Deck name", exact: true })).toHaveValue("Izzet Spells — sample");
  await expect(page.getByText("36 total cards across all sections", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Increase Lightning Bolt quantity" })).toBeVisible();
  const curve = page.getByRole("list", { name: "Nonland mana curve" });
  await expect(curve.getByRole("listitem", { name: "1 mana value: 12 cards", exact: true })).toContainText("12");
  await page.getByRole("button", { name: "Delete deck", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Cancel", exact: true }).press("Escape");
  await expect(page.getByRole("button", { name: "Delete deck", exact: true })).toBeFocused();
  for (const width of [320, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("an unknown URL provides an accessible route back to the app", async ({ page }) => {
  const response = await page.goto("/a-page-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("main").getByRole("link", { name: "Explore cards", exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
});

for (const path of ["/", "/explore", "/decks"]) {
  test(`${path} has no automated WCAG A/AA violations or page overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    if (path === "/") await expect(page.getByRole("list", { name: "Randomly featured Magic cards" })).toBeVisible();
    if (path === "/explore") {
      await openFilters(page);
      await expect(page.getByRole("heading", { name: "Demo Blue Drake", exact: true })).toBeVisible();
    }
    if (path === "/decks") await expect(page.getByRole("button", { name: "Create deck" })).toBeEnabled();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
