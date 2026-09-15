import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";

test("expanded autocomplete remains accessible", async ({ page }) => {
  await page.goto("/");
  await page.locator("#home-card-search").fill("Demo");
  await expect(page.getByRole("listbox")).toBeVisible();
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole("option", { name: "Demo Red Bolt", exact: true }).click();
  await expect(page).toHaveURL(/\/explore\?q=Demo(?:%20|\+)Red(?:%20|\+)Bolt/);
});

test("autocomplete rejects oversized requests without contacting the card service", async ({ request }) => {
  const response = await request.get(`/api/cards/autocomplete?q=${"a".repeat(257)}`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ suggestions: [] });
});

test("responses apply browser security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

for (const view of ["detail", "compact"]) {
  test(`${view} results retain accessible structure and contained scrolling`, async ({ page }) => {
    await page.goto(`/explore?q=Demo&view=${view}`);
    await expect(page.locator("#card-results")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()).violations).toEqual([]);
  });
}

test("skip navigation and reduced motion work together", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("search results and local deck workspaces stay out of search indexes", async ({ page }) => {
  for (const path of ["/explore?q=Demo", "/decks/local-only-deck"]) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("public pages have distinct descriptions and social images", async ({ page, request }) => {
  const titles = new Set<string>();
  for (const path of ["/", "/explore", "/decks"]) {
    await page.goto(path);
    titles.add(await page.title());
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Magic/);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Spellbook");
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
  expect(titles.size).toBe(3);
  const imagePath = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!).pathname;
  const image = await request.get(imagePath);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  const png = await image.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  expect((await request.get("/sitemap.xml")).ok()).toBe(true);
});

test("navigation remains centered across layouts and routes", async ({ page }) => {
  for (const width of [320, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/explore", "/decks"]) {
      await page.goto(path);
      const links = page.locator(".site-navigation-links");
      const bounds = await links.boundingBox();
      expect(bounds).not.toBeNull();
      expect(Math.abs(bounds!.x + bounds!.width / 2 - width / 2)).toBeLessThan(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const brand = await page.getByRole("link", { name: "Spellbook home", exact: true }).boundingBox();
      expect(brand).not.toBeNull();
      if (width >= 640) expect(brand!.x + brand!.width).toBeLessThanOrEqual(bounds!.x);
      else expect(brand!.y + brand!.height).toBeLessThanOrEqual(bounds!.y);
    }
  }
});

test("search uses a single visible green focus indicator and quiet suggestions", async ({ page }) => {
  await page.goto("/");
  const search = page.locator("#home-card-search");
  await search.focus();
  await expect(search).toBeFocused();
  await expect(search).toHaveCSS("outline-style", "none");
  await expect(page.locator(".card-search-field")).toHaveCSS("border-color", "rgb(145, 196, 165)");
  await search.fill("Demo");
  await expect(page.getByRole("listbox")).toBeVisible();
  await search.press("ArrowDown");
  await expect(page.getByRole("option", { selected: true })).toHaveCount(1);
  await search.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await search.press("Tab");
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toHaveCSS("outline-style", "solid");
});

test("primary navigation stays usable at 320px and identifies the current page", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  for (const label of ["Home", "Explore", "Decks", "Home"]) {
    await navigation.getByRole("link", { name: label, exact: true }).click();
    await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("the favicon and touch icon are served and declared in page metadata", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  const svg = await request.get("/icon.svg");
  expect(svg.ok()).toBe(true);
  expect(await svg.text()).toContain("#213b30");
  const favicon = await request.get("/favicon.ico");
  expect(favicon.ok()).toBe(true);
  const bytes = await favicon.body();
  expect(bytes.readUInt16LE(2)).toBe(1);
  expect(bytes.readUInt16LE(4)).toBe(3);
  for (let index = 0; index < 3; index += 1) {
    const offset = bytes.readUInt32LE(6 + index * 16 + 12);
    expect(bytes.subarray(offset + 1, offset + 4).toString()).toBe("PNG");
  }
  const touchIcon = await request.get("/apple-icon.png");
  expect(touchIcon.ok()).toBe(true);
  const png = await touchIcon.body();
  expect(png.readUInt32BE(16)).toBe(180);
  expect(png.readUInt32BE(20)).toBe(180);
});
