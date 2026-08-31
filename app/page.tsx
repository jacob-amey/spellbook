import Form from "next/form";
import Link from "next/link";

import CardCatalogue from "@/components/card-catalogue";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-hidden bg-paper/70 text-ink"
    >
      <section
        id="top"
        className="relative grid gap-14 overflow-hidden px-6 py-20 lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-[7vw] lg:py-28"
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
          className="absolute right-[5%] top-[8%] text-5xl text-orange/80"
          aria-hidden="true"
        >
          ✦
        </span>

        <div className="relative z-10">
          <p className="mb-5 text-[11px] font-extrabold tracking-[0.22em] text-orange">
            THE MULTIVERSE, CATALOGUED
          </p>

          <h1 className="max-w-2xl font-display text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Find the card.
            <br />
            <em className="font-medium text-moss">Know the magic.</em>
          </h1>

          <p className="mt-8 max-w-xl border-l border-orange/45 pl-5 text-base leading-7 text-ink/65 sm:text-lg">
            Search every Magic: The Gathering card ever printed. Explore art,
            rulings, formats, and prices in one carefully organized place.
          </p>
        </div>

        <div
          id="search"
          role="search"
          className="relative z-10 border border-orange/25 bg-forest/90 p-5 text-cream shadow-[12px_12px_0_rgb(230_161_95_/_0.12)] backdrop-blur-sm sm:p-7 sm:shadow-[18px_18px_0_rgb(230_161_95_/_0.12)]"
        >
          <div
            className="absolute right-5 top-4 font-display text-4xl text-orange/20"
            aria-hidden="true"
          >
            Ⅶ
          </div>

          <label
            htmlFor="card-search"
            className="mb-3 block text-xs font-bold uppercase tracking-[0.11em] text-cream/75"
          >
            Search the archive
          </label>

          <Form
            action="/"
            scroll={false}
            className="grid grid-cols-[auto_1fr] items-center gap-1 bg-cream p-1.5 text-night sm:grid-cols-[auto_1fr_auto]"
          >
            <span className="pl-3 text-2xl text-night/60" aria-hidden="true">
              ⌕
            </span>

            <input
              key={query}
              id="card-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Try “Black Lotus” or “t:dragon c:red”"
              className="min-w-0 bg-transparent px-3 py-3 text-night outline-none placeholder:text-night/45"
            />

            <button
              type="submit"
              className="col-span-2 bg-orange px-6 py-3 font-bold text-night transition hover:brightness-110 sm:col-span-1"
            >
              Search
            </button>
          </Form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-cream/70">
            <span>Try</span>

            <Link
              href={{
                pathname: "/",
                query: { q: "t:dragon t:legendary" },
              }}
              scroll={false}
              className="rounded-full border border-cream/20 px-3 py-2 text-cream transition hover:border-orange/60 hover:bg-orange/10"
            >
              Legendary dragons
            </Link>

            <Link
              href={{
                pathname: "/",
                query: { q: "t:instant c:u" },
              }}
              scroll={false}
              className="rounded-full border border-cream/20 px-3 py-2 text-cream transition hover:border-orange/60 hover:bg-orange/10"
            >
              Blue instants
            </Link>

            <Link
              href={{
                pathname: "/",
                query: { q: "usd<5 game:paper" },
              }}
              scroll={false}
              className="rounded-full border border-cream/20 px-3 py-2 text-cream transition hover:border-orange/60 hover:bg-orange/10"
            >
              Under $5
            </Link>
          </div>
        </div>
      </section>

      <section
        id="browse"
        className="border-t border-orange/15 bg-parchment/95 px-6 py-20 lg:px-[7vw]"
      >
        <p className="mb-4 text-[11px] font-extrabold tracking-[0.19em] text-orange">
          {query ? "SEARCH RESULTS" : "A RANDOM DRAW"}
        </p>

        <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
          {query ? "Search the archive" : "Featured from the archive"}
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/60">
          {query
            ? "Refine your terms, open a card on Scryfall, or add a result directly to one of your decks."
            : "Every visit reveals a different group of cards from across Magic’s paper history."}
        </p>

        <CardCatalogue key={query} query={query} />
      </section>
    </main>
  );
}
