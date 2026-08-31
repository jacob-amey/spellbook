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
      className="border border-ink/15 bg-paper p-5"
      aria-labelledby="deck-statistics-heading"
    >
      <h2
        id="deck-statistics-heading"
        className="font-display text-2xl"
      >
        Deck statistics
      </h2>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/55">Playable</dt>
          <dd className="mt-1 font-display text-2xl">
            {analysis.totals.playable}
          </dd>
        </div>

        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/55">Unique</dt>
          <dd className="mt-1 font-display text-2xl">
            {analysis.totals.unique}
          </dd>
        </div>

        <div className="bg-parchment px-2 py-3">
          <dt className="text-xs text-ink/55">Average MV</dt>
          <dd className="mt-1 font-display text-2xl">
            {analysis.averageManaValue.toFixed(1)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/55">
          Mana curve
        </h3>

        <ol className="mt-3 grid h-32 grid-cols-8 items-end gap-1">
          {analysis.manaCurve.map((bucket) => (
            <li
              key={bucket.label}
              className="grid h-full grid-rows-[1fr_auto] items-end gap-1 text-center"
              aria-label={`${bucket.label} mana value: ${bucket.count} cards`}
            >
              <div className="flex h-full items-end bg-parchment">
                <span
                  className="block w-full bg-forest transition-[height]"
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
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/55">
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
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/55">
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
    </section>
  );
}
