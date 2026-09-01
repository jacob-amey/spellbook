import type { Metadata } from "next";
import Link from "next/link";

import CardCatalogue from "@/components/card-catalogue";
import {
  CARD_TYPE_OPTIONS,
  COLOR_MATCH_OPTIONS,
  COLOR_OPTIONS,
  FORMAT_OPTIONS,
  RARITY_OPTIONS,
  RESULT_VIEW_OPTIONS,
  SORT_OPTIONS,
  UNIQUE_OPTIONS,
  buildScryfallQuery,
  getActiveFilterLabels,
  getQueryExplanations,
  parseExploreFilters,
  type SearchParamRecord,
} from "@/lib/card-filters";

export const metadata: Metadata = {
  title: "Explore Cards | Spellbook",
  description:
    "Search Magic cards by name, rules text, color, mana value, type, legality, artist, price, set, and release date.",
};

type ExplorePageProps = {
  searchParams: Promise<SearchParamRecord>;
};

const controlClassName =
  "mt-2 min-h-11 w-full border border-ink/20 bg-paper px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/45 focus:border-orange focus:ring-2 focus:ring-orange/20";

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const filters = parseExploreFilters(await searchParams);
  const scryfallQuery = buildScryfallQuery(filters);
  const activeFilterLabels = getActiveFilterLabels(filters);
  const queryExplanations = getQueryExplanations(filters);
  const isRandomDraw = scryfallQuery.length === 0;
  const hasAdvancedFilters = Boolean(
    filters.subtype ||
      filters.oracleText ||
      filters.keyword ||
      filters.setCode ||
      filters.artist ||
      filters.priceMin ||
      filters.priceMax ||
      filters.releasedAfter ||
      filters.releasedBefore ||
      filters.unique === "prints",
  );

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-76px)] bg-paper/70 px-6 py-12 text-ink lg:px-[5vw] lg:py-16"
    >
      <div className="mx-auto max-w-[1540px]">
        <header className="grid gap-7 border-b border-orange/15 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:items-end">
          <div className="max-w-4xl">
            <p className="mb-4 text-[11px] font-extrabold tracking-[0.2em] text-orange">
              EXPLORE THE ARCHIVE
            </p>
            <h1 className="font-display text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              Find the exact card.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-ink/70">
              Combine human-friendly filters or paste Scryfall syntax directly.
              Every search lives in the URL, making results easy to bookmark,
              share, and reproduce.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10 text-center">
            {[
              ["Search", "Oracle-aware"],
              ["Inspect", "Rulings + prices"],
              ["Build", "Add in one step"],
            ].map(([title, detail]) => (
              <div key={title} className="bg-paper/90 px-3 py-4">
                <strong className="block text-sm text-orange">{title}</strong>
                <span className="mt-1 block text-[11px] text-ink/60">{detail}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="self-start border border-orange/15 bg-parchment/90 p-5 shadow-[0_24px_80px_rgb(0_0_0_/_0.18)] xl:sticky xl:top-24">
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange">
                  Refine results
                </p>
                <h2 className="mt-1 font-display text-2xl">Card filters</h2>
              </div>
              {activeFilterLabels.length > 0 && (
                <Link
                  href="/explore"
                  className="min-h-11 px-2 py-3 text-xs font-bold text-orange transition hover:text-cream"
                >
                  Clear all
                </Link>
              )}
            </div>

            <form action="/explore" method="get" className="mt-5 space-y-5">
              <div>
                <label htmlFor="explore-query" className="text-sm font-bold">
                  Name, rules text, or syntax
                </label>
                <input
                  id="explore-query"
                  name="q"
                  type="search"
                  defaultValue={filters.query}
                  placeholder="Lightning Bolt or o:flying"
                  className={controlClassName}
                />
                <p className="mt-2 text-xs leading-5 text-ink/60">
                  Plain words and advanced Scryfall terms can be combined.
                </p>
              </div>

              <fieldset>
                <legend className="text-sm font-bold">Mana colors</legend>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="grid min-h-11 cursor-pointer place-items-center border border-ink/15 bg-paper text-sm font-bold has-checked:border-orange has-checked:bg-orange has-checked:text-night"
                      title={option.label}
                    >
                      <input
                        type="checkbox"
                        name="color"
                        value={option.value}
                        defaultChecked={filters.colors.includes(option.value)}
                        className="sr-only"
                      />
                      <span aria-hidden="true">{option.shortLabel}</span>
                      <span className="sr-only">{option.label}</span>
                    </label>
                  ))}
                  <label
                    className="grid min-h-11 cursor-pointer place-items-center border border-ink/15 bg-paper text-xs font-bold has-checked:border-orange has-checked:bg-orange has-checked:text-night"
                    title="Colorless"
                  >
                    <input
                      type="checkbox"
                      name="colorless"
                      value="true"
                      defaultChecked={filters.colorless}
                      className="sr-only"
                    />
                    <span aria-hidden="true">C</span>
                    <span className="sr-only">Colorless</span>
                  </label>
                </div>
                <label className="mt-3 block text-xs font-bold text-ink/70">
                  Color relationship
                  <select name="colorMode" defaultValue={filters.colorMode} className={controlClassName}>
                    {COLOR_MATCH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold">Mana value range</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-ink/70">
                    Minimum
                    <input name="mvMin" type="number" min="0" max="30" step="1" inputMode="numeric" defaultValue={filters.manaMin} placeholder="0" className={controlClassName} />
                  </label>
                  <label className="text-xs font-bold text-ink/70">
                    Maximum
                    <input name="mvMax" type="number" min="0" max="30" step="1" inputMode="numeric" defaultValue={filters.manaMax} placeholder="Any" className={controlClassName} />
                  </label>
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <label className="text-sm font-bold">
                  Card type
                  <select name="type" defaultValue={filters.cardType} className={controlClassName}>
                    {CARD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Rarity
                  <select name="rarity" defaultValue={filters.rarity} className={controlClassName}>
                    {RARITY_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Legal in format
                  <select name="format" defaultValue={filters.format} className={controlClassName}>
                    {FORMAT_OPTIONS.map((option) => (
                      <option key={option.value || "any"} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold">
                  Sort results
                  <select name="sort" defaultValue={filters.sort} className={controlClassName}>
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <details className="group border-y border-ink/10 py-4" open={hasAdvancedFilters}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-orange">
                  Advanced filters
                  <span className="text-lg transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>

                <div className="mt-4 space-y-4">
                  {[
                    ["Subtype", "subtype", filters.subtype, "Elf, Equipment, Saga"],
                    ["Oracle text", "oracle", filters.oracleText, "draw a card"],
                    ["Keyword", "keyword", filters.keyword, "flying"],
                    ["Set code", "set", filters.setCode, "MKM"],
                    ["Artist", "artist", filters.artist, "Rebecca Guay"],
                  ].map(([label, name, value, placeholder]) => (
                    <label key={name} className="block text-xs font-bold text-ink/75">
                      {label}
                      <input name={name} defaultValue={value} placeholder={placeholder} className={controlClassName} />
                    </label>
                  ))}

                  <fieldset>
                    <legend className="text-xs font-bold text-ink/75">USD price range</legend>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="sr-only" htmlFor="price-min">Minimum USD price</label>
                      <input id="price-min" name="priceMin" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={filters.priceMin} placeholder="Min $" className={controlClassName} />
                      <label className="sr-only" htmlFor="price-max">Maximum USD price</label>
                      <input id="price-max" name="priceMax" type="number" min="0" step="0.01" inputMode="decimal" defaultValue={filters.priceMax} placeholder="Max $" className={controlClassName} />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="text-xs font-bold text-ink/75">Release window</legend>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <label className="text-xs text-ink/65">
                        From
                        <input name="releasedAfter" type="date" defaultValue={filters.releasedAfter} className={controlClassName} />
                      </label>
                      <label className="text-xs text-ink/65">
                        Through
                        <input name="releasedBefore" type="date" defaultValue={filters.releasedBefore} className={controlClassName} />
                      </label>
                    </div>
                  </fieldset>

                  <label className="block text-xs font-bold text-ink/75">
                    Printing scope
                    <select name="unique" defaultValue={filters.unique} className={controlClassName}>
                      {UNIQUE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </details>

              <fieldset>
                <legend className="text-sm font-bold">Result view</legend>
                <div className="mt-2 grid grid-cols-3 gap-px border border-ink/15 bg-ink/15">
                  {RESULT_VIEW_OPTIONS.map((option) => (
                    <label key={option.value} className="grid min-h-11 cursor-pointer place-items-center bg-paper px-2 text-center text-xs font-bold has-checked:bg-forest has-checked:text-cream">
                      <input type="radio" name="view" value={option.value} defaultChecked={filters.view === option.value} className="sr-only" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="min-h-12 w-full bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110">
                Apply filters
              </button>
            </form>
          </aside>

          <section aria-labelledby="explore-results-heading" className="min-w-0">
            <div className="border-b border-orange/15 pb-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange">
                {isRandomDraw ? "RANDOM DISCOVERIES" : "FILTERED RESULTS"}
              </p>
              <h2 id="explore-results-heading" className="mt-3 font-display text-4xl tracking-tight">
                {isRandomDraw ? "A fresh page from the archive" : "Matching cards"}
              </h2>

              {activeFilterLabels.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
                  {activeFilterLabels.map((label) => (
                    <li key={label} className="rounded-full border border-moss/25 bg-moss/10 px-3 py-1.5 text-xs text-moss">{label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/65">
                  No filters are active, so this grid begins with a randomized
                  selection. Draw again or use the controls to narrow the archive.
                </p>
              )}

              {queryExplanations.length > 0 && (
                <details className="mt-5 border border-ink/10 bg-paper/45 p-4">
                  <summary className="min-h-8 cursor-pointer text-sm font-bold text-orange">
                    Explain this search
                  </summary>
                  <code className="mt-3 block overflow-x-auto bg-night px-4 py-3 text-xs leading-6 text-moss">{scryfallQuery}</code>
                  <dl className="mt-4 grid gap-3 md:grid-cols-2">
                    {queryExplanations.map((explanation, index) => (
                      <div key={`${explanation.token}:${index}`} className="border-l border-orange/30 pl-3">
                        <dt className="text-xs font-bold text-ink/90">
                          <code className="text-orange">{explanation.token}</code> · {explanation.label}
                        </dt>
                        <dd className="mt-1 text-xs leading-5 text-ink/65">{explanation.description}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>

            <CardCatalogue
              key={`${scryfallQuery}:${filters.sort}:${filters.unique}:${filters.view}`}
              query={scryfallQuery}
              sortOrder={filters.sort}
              unique={filters.unique}
              view={filters.view}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
