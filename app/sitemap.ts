import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable) return [];
  return ["/", "/explore", "/decks"].map((path) => ({ url: new URL(path, site.origin).href }));
}
