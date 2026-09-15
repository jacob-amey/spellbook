import type {
  CardTypeCategory,
  DeckAnalysis,
  DeckColorCategory,
} from "@/types/deck";

type DeckStatisticsProps = {
  analysis: DeckAnalysis;
};

const TYPE_ORDER: CardTypeCategory[] = [
  "Land",
  "Creature",
  "Planeswalker",
  "Instant",
  "Sorcery",
  "Artifact",
  "Enchantment",
  "Battle",
  "Other",
];

const COLOR_DETAILS: Record<
  DeckColorCategory,
  { name: string; className: string }
> = {
  W: { name: "White", className: "bg-amber-100 text-night" },
  U: { name: "Blue", className: "bg-blue-700 text-white" },
  B: { name: "Black", className: "bg-zinc-800 text-white" },
  R: { name: "Red", className: "bg-red-700 text-white" },
  G: { name: "Green", className: "bg-emerald-700 text-white" },
  C: { name: "Colorless", className: "bg-stone-300 text-night" },
};

export function DeckStatistics({
  analysis,
}: DeckStatisticsProps) {
  const largestCurveCount = Math.max(
    1,
    ...analysis.manaCurve.map((bucket) => bucket.count),
  );

  const visibleTypes = TYPE_ORDER.filter(
    (type) => analysis.typeCounts[type] > 0,
  );

  const visibleColors = (
    Object.keys(COLOR_DETAILS) as DeckColorCategory[]
  ).filter((color) => analysis.colorCounts[color] > 0);

  return (
    <section
      className="rounded-xl border border-ink/15 bg-paper p-5 tabular-nums"
      aria-labelledby="deck-statistics-heading"
    >
      <h2
        id="deck-statistics-heading"
        className="text-xl font-semibold"
      >
        Deck statistics
      </h2>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/70">Deck size</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {analysis.totals.playable}
          </dd>
        </div>

        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/70">Unique</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {analysis.totals.unique}
          </dd>
        </div>

        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/70">Average MV</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {analysis.averageManaValue.toFixed(1)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-ink/70">
          Mana curve
        </h3>

        <p className="mt-2 text-xs leading-5 text-ink/65">Nonland cards · sideboard excluded</p>
        <ol aria-label="Nonland mana curve" className="mt-3 grid h-36 grid-cols-8 items-end gap-1">
          {analysis.manaCurve.map((bucket) => (
            <li
              key={bucket.label}
              className="grid h-full grid-rows-[auto_1fr_auto] items-end gap-1 text-center"
              aria-label={`${bucket.label} mana value: ${bucket.count} cards`}
              title={`${bucket.label} mana value: ${bucket.count} cards`}
            >
              <span className="text-xs font-semibold text-ink/80" aria-hidden="true">{bucket.count}</span>
              <div className="flex h-full items-end bg-parchment">
                <span
                  className="block w-full bg-moss/70 transition-[height]"
                  style={{
                    height: `${
                      (bucket.count / largestCurveCount) * 100
                    }%`,
                    minHeight: bucket.count > 0 ? "4px" : "0",
                  }}
                  aria-hidden="true"
                />
              </div>

              <span className="text-[11px] font-bold">
                {bucket.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-ink/70">
          Card types
        </h3>

        {visibleTypes.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">
            Add cards to see a type breakdown.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {visibleTypes.map((type) => (
              <li
                key={type}
                className="flex items-center justify-between gap-4"
              >
                <span>{type}</span>
                <strong>{analysis.typeCounts[type]}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-ink/70">
          Color identity
        </h3>

        {visibleColors.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">
            Add cards to see their colors.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {visibleColors.map((color) => (
              <li
                key={color}
                className={`rounded-full px-3 py-1 text-xs font-bold ${COLOR_DETAILS[color].className}`}
                aria-label={`${COLOR_DETAILS[color].name}: ${analysis.colorCounts[color]} cards`}
              >
                {color} · {analysis.colorCounts[color]}
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="mt-6 border-t border-ink/15 pt-4 text-xs leading-5 text-ink/70">
        <summary className="cursor-pointer font-semibold text-ink">How statistics are calculated</summary>
        <ul className="mt-3 list-disc space-y-2 pl-4">
          <li>Deck size, card types, and color counts include the mainboard and commanders, not the sideboard.</li>
          <li>Unique counts distinct cards across all sections, regardless of printing.</li>
          <li>Average mana value and the curve exclude lands and weight each card by its quantity.</li>
          <li>Multicolor cards count once in each of their colors. The color totals can exceed the deck size.</li>
        </ul>
      </details>
    </section>
  );
}
