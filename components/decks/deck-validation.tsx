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
      className="rounded-xl border border-ink/15 bg-paper p-5"
      aria-labelledby="deck-validation-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="deck-validation-heading"
            className="text-xl font-semibold tracking-tight"
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
          className="mt-5 border border-moss/25 bg-moss/10 p-4 text-sm font-bold text-moss"
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
                  : "border-amber-400 bg-amber-400/10"
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
