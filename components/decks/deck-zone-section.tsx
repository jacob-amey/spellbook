import { DeckCardRow } from "@/components/decks/deck-card-row";
import { formatDeckZone } from "@/lib/deck-operations";
import type { DeckEntry, DeckZone } from "@/types/deck";

type DeckZoneSectionProps = {
  deckId: string;
  entries: DeckEntry[];
  zone: DeckZone;
  onFeedback: (
    message: string,
    kind?: "success" | "error",
  ) => void;
};

const ZONE_DESCRIPTIONS: Record<DeckZone, string> = {
  mainboard: "The cards you will normally draw and play.",
  sideboard: "Cards reserved for matchups or between-game changes.",
  commander: "Your commander or compatible commander pair.",
};

export function DeckZoneSection({
  deckId,
  entries,
  zone,
  onFeedback,
}: DeckZoneSectionProps) {
  const sortedEntries = [...entries].sort((first, second) =>
    first.card.name.localeCompare(second.card.name),
  );
  const cardCount = entries.reduce(
    (total, entry) => total + entry.quantity,
    0,
  );
  const headingId = `${zone}-heading`;

  return (
    <section
      className="border border-ink/15 bg-paper p-5 sm:p-6"
      aria-labelledby={headingId}
    >
      <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
        <div>
          <h2
            id={headingId}
            className="font-display text-3xl"
          >
            {formatDeckZone(zone)}
          </h2>

          <p className="mt-1 text-sm text-ink/55">
            {ZONE_DESCRIPTIONS[zone]}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-parchment px-3 py-1 text-xs font-bold">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </span>
      </div>

      {sortedEntries.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          No cards in this section yet.
        </p>
      ) : (
        <ul>
          {sortedEntries.map((entry) => (
            <DeckCardRow
              key={`${entry.card.oracleId}:${entry.zone}`}
              deckId={deckId}
              entry={entry}
              onFeedback={onFeedback}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
