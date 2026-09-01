import Link from "next/link";

import { CardSearch } from "@/components/card-search";
import { ContinueDeck } from "@/components/continue-deck";
import { FeaturedCardRail } from "@/components/featured-card-rail";

const quickSearches = [
  { label: "Legendary dragons", query: "t:dragon t:legendary" },
  { label: "Blue instants", query: "t:instant c:u" },
  { label: "Cards under $5", query: "usd<5 game:paper" },
];

export default function Home() {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-hidden bg-paper/70 text-ink"
    >
      <section
        id="top"
        className="relative px-6 py-14 lg:px-[5vw] lg:py-20"
      >
        <div
          className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full border border-orange/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-28 top-22 h-72 w-72 rounded-full border border-moss/10"
          aria-hidden="true"
        />
        <span
          className="absolute right-[7%] top-[12%] text-5xl text-orange/75"
          aria-hidden="true"
        >
          ✦
        </span>

        <div className="relative z-10 mx-auto grid max-w-[1540px] gap-14 xl:grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] xl:items-start xl:gap-10 2xl:gap-16">
          <div className="max-w-2xl xl:pt-5">
            <div>
              <p className="mb-5 text-[11px] font-extrabold tracking-[0.22em] text-orange">
                THE MULTIVERSE, CATALOGUED
              </p>

              <h1 className="font-display text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl 2xl:text-7xl">
                Find the card.
                <br />
                <em className="font-medium text-moss">Build the story.</em>
              </h1>

              <p className="mt-7 max-w-xl border-l border-orange/45 pl-5 text-base leading-7 text-ink/65 sm:text-lg">
                Search the complete Magic: The Gathering archive, discover
                something new, and turn the best ideas into finished decks.
              </p>
            </div>

            <div id="search" className="mt-9">
              <CardSearch id="home-card-search" />

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                <span className="mr-1 font-bold uppercase tracking-[0.11em]">
                  Quick finds
                </span>
                {quickSearches.map((search) => (
                  <Link
                    key={search.label}
                    href={{ pathname: "/explore", query: { q: search.query } }}
                    className="rounded-full border border-ink/15 px-3 py-2 text-ink/75 transition hover:border-orange/50 hover:text-orange"
                  >
                    {search.label}
                  </Link>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/explore"
                  className="bg-forest px-5 py-3 text-sm font-bold text-cream transition hover:bg-fern"
                >
                  Advanced Explore
                </Link>
                <Link
                  href="/decks"
                  className="border border-ink/20 px-5 py-3 text-sm font-bold transition hover:border-orange hover:text-orange"
                >
                  Deck builder
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <ContinueDeck />
            </div>
          </div>

          <section
            id="featured"
            className="min-w-0 border-t border-orange/20 pt-7 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0 2xl:pl-14"
            aria-labelledby="featured-heading"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-[11px] font-extrabold tracking-[0.19em] text-orange">
                  A RANDOM DRAW
                </p>
                <h2
                  id="featured-heading"
                  className="font-display text-4xl tracking-tight 2xl:text-5xl"
                >
                  Twenty cards. One new idea.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-ink/65">
                  Scroll the row for a fresh starting point, or draw again.
                </p>
              </div>

              <Link
                href="/explore"
                className="shrink-0 text-sm font-bold text-orange transition hover:text-cream"
              >
                Filter cards →
              </Link>
            </div>

            <FeaturedCardRail />
          </section>
        </div>
      </section>
    </main>
  );
}
