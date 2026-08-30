import type { DeckAnalysis } from "@/types/deck";

type DeckValidationProps = {
  analysis: DeckAnalysis;
};

export function DeckValidation({
  analysis,
}: DeckValidationProps) {
  const errorCount = analysis.issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warningCount =
    analysis.issues.length - errorCount;

  return (
    <section
      className="border border-ink/15 bg-paper p-5"
      aria-labelledby="deck-validation-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="deck-validation-heading"
            className="font-display text-2xl"
          >
            Deck checks
          </h2>

          <p className="mt-1 text-xs leading-5 text-ink/55">
            Guidance based on the saved Scryfall data, not an
            authoritative tournament rules engine.
          </p>
        </div>

        {analysis.issues.length > 0 && (
          <span className="shrink-0 text-xs font-bold text-ink/55">
            {errorCount} errors · {warningCount} warnings
          </span>
        )}
      </div>

      {analysis.issues.length === 0 ? (
        <p
          className="mt-5 border border-forest/20 bg-forest/5 p-4 text-sm font-bold text-forest"
          role="status"
        >
          No deck-building issues detected.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {analysis.issues.map((issue) => (
            <li
              key={issue.id}
              className={`border-l-4 p-3 text-sm leading-6 ${
                issue.severity === "error"
                  ? "border-orange bg-orange/5"
                  : "border-amber-500 bg-amber-50"
              }`}
            >
              <strong className="mr-2 text-xs uppercase tracking-wide">
                {issue.severity}
              </strong>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
