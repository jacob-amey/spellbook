import type { Metadata } from "next";

type SiteEnvironment = { SITE_URL?: string; VERCEL_ENV?: string; VERCEL_PROJECT_PRODUCTION_URL?: string };

export function resolveSite(environment: SiteEnvironment) {
  const candidate = environment.SITE_URL || (environment.VERCEL_PROJECT_PRODUCTION_URL ? `https://${environment.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
  let origin: string | undefined;
  if (candidate) {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error("SITE_URL must be a public HTTPS origin without credentials, a path, query, or fragment.");
    }
    origin = url.origin;
  }
  return { origin, indexable: Boolean(origin) && (!environment.VERCEL_ENV || environment.VERCEL_ENV === "production") };
}

export const site = resolveSite({ SITE_URL: process.env.SITE_URL, VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL });

export function pageMetadata(title: string, description: string, path: string, index = true): Metadata {
  const url = site.origin ? new URL(path, site.origin).href : undefined;
  return {
    title,
    description,
    alternates: url && index ? { canonical: url } : undefined,
    robots: { index: site.indexable && index, follow: true },
    openGraph: { title, description, url, siteName: "Spellbook", type: "website", locale: "en_US", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Spellbook — Magic card research and deck building" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
