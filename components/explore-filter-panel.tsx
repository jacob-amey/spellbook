"use client";

import { useId, useState, type ReactNode } from "react";

export function ExploreFilterPanel({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  return (
    <aside className="self-start rounded-lg border border-ink/10 bg-parchment/60 p-5 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-medium text-ink xl:hidden"
      >
        <span>{expanded ? "Hide search filters" : "Search and filter cards"}{activeCount > 0 ? ` (${activeCount} active)` : ""}</span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div id={contentId} className={expanded ? "mt-4 xl:mt-0" : "hidden xl:block"}>
        {children}
      </div>
    </aside>
  );
}
