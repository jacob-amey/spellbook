import { describe, expect, it } from "vitest";
import { resolveSite } from "@/lib/site";

describe("public site configuration", () => {
  it("does not index an unconfigured local build", () => {
    expect(resolveSite({})).toEqual({ origin: undefined, indexable: false });
  });
  it("uses an explicit production origin", () => {
    expect(resolveSite({ SITE_URL: "https://spellbook.example/" })).toEqual({ origin: "https://spellbook.example", indexable: true });
  });
  it("uses the stable Vercel production domain", () => {
    expect(resolveSite({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "spellbook.example" })).toEqual({ origin: "https://spellbook.example", indexable: true });
  });
  it("never indexes Vercel previews even with a production origin", () => {
    expect(resolveSite({ VERCEL_ENV: "preview", SITE_URL: "https://spellbook.example" }).indexable).toBe(false);
  });
  it.each(["http://example.com", "https://localhost", "https://127.0.0.1", "https://[::1]", "https://user:pass@example.com", "https://example.com/app", "https://example.com?q=x", "https://example.com#x", "not a url"])("rejects invalid origins: %s", (SITE_URL) => {
    expect(() => resolveSite({ SITE_URL })).toThrow();
  });
});
