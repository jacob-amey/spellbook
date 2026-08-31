import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import CardCatalogue from "@/components/card-catalogue";
import {
  CARD_TYPE_OPTIONS,
  COLOR_OPTIONS,
  FORMAT_OPTIONS,
  MANA_VALUE_OPTIONS,
  RARITY_OPTIONS,
  SORT_OPTIONS,
  buildScryfallQuery,
  getActiveFilterLabels,
  parseExploreFilters,
  type SearchParamRecord,
} from "@/lib/card-filters";

export const metadata: Metadata = {
  title: "Explore Cards | Spellbook",
  description:
    "Search and filter Magic: The Gathering cards by color, mana value, type, rarity, format, and more.",
};

type ExplorePageProps = {
  searchParams: Promise<SearchParamRecord>;
};

const selectClassName =
  "mt-2 w-full border border-ink/20 bg-paper px-3 py-3 text-sm text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/20";

export default async function ExplorePage({
  searchParams,
}: ExplorePageProps) {
  const filters = parseExploreFilters(await searchParams);
  const scryfallQuery = buildScryfallQuery(filters);
  const activeFilterLabels = getActiveFilterLabels(filters);
  const isRandomDraw = scryfallQuery.length === 0;

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-76px)] bg-paper/70 px-6 py-14 text-ink lg:px-[5vw] lg:py-20"
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="max-w-4xl">
          <p className="mb-4 text-[11px] font-extrabold tracking-[0.2em] text-orange">
            EXPLORE THE ARCHIVE
          </p>
          <h1 className="font-display text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
            Dial in your discovery.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-ink/65">
            Start with a name or rules term, then combine color, mana value,
            card type, rarity, and format filters. Your choices stay in the URL
            so every search can be bookmarked or shared.
          </p>
        </header>

        <div className="mt-10 grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="self-start border border-orange/15 bg-parchment/90 p-5 shadow-[0_24px_80px_rgb(0_0_0_/_0.18)] xl:sticky xl:top-24">
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
              <h2 className="font-display text-2xl">Card filters</h2>
              {activeFilterLabels.length > 0 && (
                <Link
                  href="/explore"
                  className="text-xs font-bold text-orange transition hover:text-cream"
                >
                  Clear all
                </Link>
              )}
            </div>

            <Form action="/explore" className="mt-5 space-y-5">
              <div>
                <label htmlFor="explore-query" className="text-sm font-bold">
                  Card name or text
                </label>
                <input
                  id="explore-query"
                  name="q"
                  type="search"
                  defaultValue={filters.query}
                  placeholder="Lightning Bolt"
                  className="mt-2 w-full border border-ink/20 bg-paper px-3 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
                <p className="mt-2 text-xs leading-5 text-ink/45">
                  Advanced terms work too, such as{" "}
                  <code className="text-moss">o:flying</code> or{" "}
                  <code className="text-moss">pow&gt;=5</code>.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <label className="text-sm font-bold">
                  Mana color
                  <select
                    name="color"
                    defaultValue={filters.color}
                    className={selectClassName}
                  >
                    {COLOR_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Mana value (cost)
                  <select
                    name="mv"
                    defaultValue={filters.manaValue}
                    className={selectClassName}
                  >
                    {MANA_VALUE_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Card type
                  <select
                    name="type"
                    defaultValue={filters.cardType}
                    className={selectClassName}
                  >
                    {CARD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Rarity
                  <select
                    name="rarity"
                    defaultValue={filters.rarity}
                    className={selectClassName}
                  >
                    {RARITY_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Legal in format
                  <select
                    name="format"
                    defaultValue={filters.format}
                    className={selectClassName}
                  >
                    {FORMAT_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Sort results
                  <select
                    name="sort"
                    defaultValue={filters.sort}
                    className={selectClassName}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110"
              >
                Apply filters
              </button>
            </Form>
          </aside>

          <section aria-labelledby="explore-results-heading">
            <div className="border-b border-orange/15 pb-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange">
                {isRandomDraw ? "RANDOM DISCOVERIES" : "FILTERED RESULTS"}
              </p>
              <h2
                id="explore-results-heading"
                className="mt-3 font-display text-4xl tracking-tight"
              >
                {isRandomDraw ? "A fresh page from the archive" : "Matching cards"}
              </h2>

              {activeFilterLabels.length > 0 ? (
                <ul
                  className="mt-5 flex flex-wrap gap-2"
                  aria-label="Active filters"
                >
                  {activeFilterLabels.map((label) => (
                    <li
                      key={label}
                      className="rounded-full border border-moss/20 bg-moss/5 px-3 py-1.5 text-xs text-moss"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/55">
                  No filters are active, so this grid begins with a randomized
                  selection. Draw again or use the controls to narrow the archive.
                </p>
              )}
            </div>

            <CardCatalogue
              key={`${scryfallQuery}:${filters.sort}`}
              query={scryfallQuery}
              sortOrder={filters.sort}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
