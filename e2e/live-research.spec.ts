import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function waitForVisibleArtwork(page: Page) {
  await expect.poll(() => page.locator("main img").evaluateAll((images) => images.every((element) => {
    const image = element as HTMLImageElement;
    const bounds = image.getBoundingClientRect();
    const visible = bounds.width > 0 && bounds.height > 0 && bounds.top < innerHeight && bounds.bottom > 0 && bounds.left < innerWidth && bounds.right > 0;
    return !visible || (image.complete && image.naturalWidth > 0);
  })), { timeout: 15_000 }).toBe(true);
}

test("live card research, artwork, and face switching", async ({ page, request }, testInfo) => {
  test.skip(process.env.LIVE_SCRYFALL !== "1", "Opt-in release check against the real card service.");
  test.setTimeout(60_000);
  const response = await request.get("https://api.scryfall.com/cards/named?exact=Delver%20of%20Secrets", {
    headers: { "User-Agent": "SpellbookReleaseCheck/0.1", Accept: "application/json" },
  });
  expect(response.ok()).toBe(true);
  const card = await response.json();
  await page.goto(`/cards/${card.id}`);
  await expect(page.getByRole("heading", { level: 1, name: card.name })).toBeVisible();
  const front = page.getByRole("img", { name: "Delver of Secrets card face", exact: true });
  await expect(front).toBeVisible();
  await expect.poll(() => front.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.getByRole("button", { name: "Insectile Aberration", exact: true }).click();
  await expect(page.getByRole("img", { name: "Insectile Aberration card face", exact: true })).toBeVisible();
  await expect.poll(() => page.getByRole("img", { name: "Insectile Aberration card face", exact: true }).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.getByRole("button", { name: "Insectile Aberration", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Rulings", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /paper printing/ })).toBeVisible();
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Spellbook");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("card-detail.png"), fullPage: true });

  await page.goto("/");
  await expect(page.getByText("20 cards · Paper printings", { exact: true })).toBeVisible();
  await expect.poll(() => page.locator("main img").first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await waitForVisibleArtwork(page);
  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
  await page.goto("/explore?q=t%3Ainstant+c%3Au");
  await expect(page.locator("#card-results article").first()).toBeVisible();
  await waitForVisibleArtwork(page);
  await page.screenshot({ path: testInfo.outputPath("explore.png"), fullPage: false });
  await page.goto("/decks");
  await page.getByRole("button", { name: "Try a sample deck" }).click();
  await expect(page.getByRole("textbox", { name: "Deck name", exact: true })).toHaveValue("Izzet Spells — sample");
  await waitForVisibleArtwork(page);
  await page.screenshot({ path: testInfo.outputPath("deck.png"), fullPage: true });
});
