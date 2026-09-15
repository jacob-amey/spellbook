import Link from "next/link";

import { CardSearch } from "@/components/card-search";
import { ContinueDeck } from "@/components/continue-deck";
import { FeaturedCardRail } from "@/components/featured-card-rail";
import { Icon } from "@/components/ui/icon";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("Spellbook — MTG Card Search & Deck Builder", "Search Magic: The Gathering cards, compare printings and rulings, and build your next deck. Explore the catalogue or try a sample deck without an account.", "/");

const quickSearches = [
  { label: "Legendary dragons", query: "t:dragon t:legendary" },
  { label: "Blue instants", query: "t:instant c:u" },
  { label: "Cards under $5", query: "usd<5 game:paper" },
];

export default function Home() {
  return (
    <main
      id="main-content"
      className="text-ink"
    >
      <section
        id="top"
        className="site-container py-8 sm:py-12 lg:py-14"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.65fr)] lg:gap-10 xl:gap-14">
          <div className="min-w-0 lg:py-6">
            <div>
              <p className="mb-5 flex items-center gap-2.5 text-xs font-medium text-moss">
                <Icon name="cards" />
                Magic: The Gathering
              </p>

              <h1 className="max-w-sm text-[2.125rem] font-semibold leading-[1.12] tracking-[-0.035em] text-balance sm:text-[2.75rem]">
                Your card catalogue.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-ink/65">
                Search the archive, compare printings, and check rulings.
                Turn the cards you find into your next deck.
              </p>
            </div>

            <div id="search" className="mt-7">
              <CardSearch id="home-card-search" />

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-0 text-xs text-ink/60">
                <span className="w-full pb-1 font-medium">
                  Try a search
                </span>
                {quickSearches.map((search) => (
                  <Link
                    key={search.label}
                    href={{ pathname: "/explore", query: { q: search.query } }}
                    className="inline-flex min-h-9 items-center text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-moss hover:decoration-moss"
                  >
                    {search.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4">
                <Link
                  href="/explore"
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-md border border-ink/15 bg-parchment/60 px-4 text-sm font-medium text-ink/85 transition-colors hover:border-moss/40 hover:bg-parchment hover:text-moss"
                >
                  <Icon name="filters" /> Advanced search
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-ink/10 pt-6">
              <ContinueDeck />
            </div>
          </div>

          <section
            id="featured"
            className="min-w-0 rounded-xl border border-ink/10 bg-parchment/45 p-4 shadow-sm sm:p-6"
            aria-labelledby="featured-heading"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="featured-heading"
                  className="text-lg font-semibold tracking-tight"
                >
                  Featured cards
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-ink/60">
                  A fresh selection from the paper catalogue.
                </p>
              </div>

              <Link
                href="/explore"
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-medium text-moss transition-colors hover:text-ink"
              >
                Explore all <Icon name="arrow-right" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <FeaturedCardRail />
          </section>
        </div>
      </section>
    </main>
  );
}
