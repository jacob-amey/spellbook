import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/site";

import CardCatalogue from "@/components/card-catalogue";
import { ExploreFilterPanel } from "@/components/explore-filter-panel";
import {
  ExploreFilterForm,
  ExploreFilterSubmit,
} from "@/components/explore-filter-form";
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

export async function generateMetadata({ searchParams }: ExplorePageProps): Promise<Metadata> {
  const params = await searchParams;
  return pageMetadata("Explore MTG Cards | Spellbook", "Find Magic cards by name, color, mana value, type, rarity, and format. Compare results in gallery, detail, or compact views and share your search.", "/explore", Object.keys(params).length === 0);
}

type ExplorePageProps = {
  searchParams: Promise<SearchParamRecord>;
};

const controlClassName =
  "mt-2 min-h-11 w-full rounded-md border border-ink/20 bg-paper px-3 py-2.5 text-sm text-ink transition placeholder:text-ink/45 focus:border-moss";

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
      className="py-8 text-ink sm:py-10"
    >
      <div className="site-container">
        <header className="border-b border-ink/15 pb-6 sm:pb-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Explore cards
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">
              Search by name, combine filters, or use Scryfall syntax. Every
              search has a link you can bookmark and share.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ExploreFilterPanel activeCount={activeFilterLabels.length}>
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
              <div>
                <h2 className="text-base font-semibold">Card filters</h2>
              </div>
              {activeFilterLabels.length > 0 && (
                <Link
                  href="/explore"
                  className="min-h-11 px-2 py-3 text-xs font-medium text-moss transition hover:text-ink"
                >
                  Clear all
                </Link>
              )}
            </div>

            <ExploreFilterForm valuesKey={JSON.stringify(filters)} className="mt-5 space-y-5">
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
                      className="grid min-h-11 cursor-pointer place-items-center rounded-md border border-ink/15 bg-paper text-sm font-medium has-checked:border-moss has-checked:bg-moss has-checked:text-night"
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
                    className="grid min-h-11 cursor-pointer place-items-center rounded-md border border-ink/15 bg-paper text-xs font-medium has-checked:border-moss has-checked:bg-moss has-checked:text-night"
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
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-moss">
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

              <p className="text-xs leading-5 text-ink/60">
                Choice filters update immediately. Typed searches and ranges
                update after a short pause.
              </p>

              <ExploreFilterSubmit />
            </ExploreFilterForm>
          </ExploreFilterPanel>

          <section aria-labelledby="explore-results-heading" className="min-w-0">
            <div className="border-b border-ink/10 pb-6">
              <h2 id="explore-results-heading" className="text-xl font-semibold tracking-tight">
                {isRandomDraw ? "Sampled cards" : "Matching cards"}
              </h2>

              {activeFilterLabels.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
                  {activeFilterLabels.map((label) => (
                    <li key={label} className="rounded-md border border-ink/15 bg-parchment px-3 py-1.5 text-xs text-ink/80">{label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/65">
                  No filters applied. Load another sample, or set filters to
                  search the catalogue.
                </p>
              )}

              {queryExplanations.length > 0 && (
                <details className="mt-5 border border-ink/10 bg-paper/45 p-4">
                  <summary className="min-h-8 cursor-pointer text-sm font-medium text-moss">
                    Explain this search
                  </summary>
                  <code className="mt-3 block overflow-x-auto bg-night px-4 py-3 text-xs leading-6 text-moss">{scryfallQuery}</code>
                  <dl className="mt-4 grid gap-3 md:grid-cols-2">
                    {queryExplanations.map((explanation, index) => (
                      <div key={`${explanation.token}:${index}`} className="border-l border-ink/20 pl-3">
                        <dt className="text-xs font-bold text-ink/90">
                          <code className="text-moss">{explanation.token}</code> · {explanation.label}
                        </dt>
                        <dd className="mt-1 text-xs leading-5 text-ink/65">{explanation.description}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>

            <CardCatalogue
              key={`${scryfallQuery}:${filters.sort}:${filters.unique}`}
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
