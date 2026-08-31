import Form from "next/form";
import Link from "next/link";

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
        className="relative px-6 py-20 lg:px-[7vw] lg:py-28"
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

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-5 text-[11px] font-extrabold tracking-[0.22em] text-orange">
              THE MULTIVERSE, CATALOGUED
            </p>

            <h1 className="font-display text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Find the card.
              <br />
              <em className="font-medium text-moss">Build the story.</em>
            </h1>

            <p className="mt-7 max-w-2xl border-l border-orange/45 pl-5 text-base leading-7 text-ink/65 sm:text-lg">
              Search the complete Magic: The Gathering archive, discover cards
              you have never seen, and turn the best ideas into finished decks.
            </p>
          </div>

          <div id="search" role="search" className="mt-10 max-w-4xl">
            <Form
              action="/explore"
              className="grid border border-orange/25 bg-cream p-1.5 text-night shadow-[12px_12px_0_rgb(230_161_95_/_0.1)] sm:grid-cols-[auto_1fr_auto]"
            >
              <span
                className="hidden place-items-center px-4 text-2xl text-night/55 sm:grid"
                aria-hidden="true"
              >
                ⌕
              </span>

              <label htmlFor="home-card-search" className="sr-only">
                Search cards
              </label>
              <input
                id="home-card-search"
                name="q"
                type="search"
                placeholder="Search a card name or try t:dragon c:red"
                className="min-w-0 bg-transparent px-4 py-4 text-night outline-none placeholder:text-night/45"
              />

              <button
                type="submit"
                className="bg-orange px-7 py-4 font-bold text-night transition hover:brightness-110"
              >
                Explore cards
              </button>
            </Form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
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

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="bg-forest px-5 py-3 text-sm font-bold text-cream transition hover:bg-fern"
              >
                Open advanced Explore
              </Link>
              <Link
                href="/decks"
                className="border border-ink/20 px-5 py-3 text-sm font-bold transition hover:border-orange hover:text-orange"
              >
                Go to deck builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="featured"
        className="border-t border-orange/15 bg-parchment/95 px-6 py-16 lg:px-[7vw] lg:py-20"
        aria-labelledby="featured-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[11px] font-extrabold tracking-[0.19em] text-orange">
                A RANDOM DRAW
              </p>
              <h2
                id="featured-heading"
                className="font-display text-4xl tracking-tight sm:text-5xl"
              >
                Twenty cards. One new idea.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/60">
                Scroll through a new selection on every visit, or draw again
                without leaving the page.
              </p>
            </div>

            <Link
              href="/explore"
              className="shrink-0 text-sm font-bold text-orange transition hover:text-cream"
            >
              Explore with filters →
            </Link>
          </div>

          <FeaturedCardRail />
        </div>
      </section>
    </main>
  );
}
