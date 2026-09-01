"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type CardSearchProps = {
  compact?: boolean;
  defaultValue?: string;
  id: string;
};

type AutocompleteResponse = {
  suggestions?: unknown;
};

function parseSuggestions(payload: AutocompleteResponse): string[] {
  return Array.isArray(payload.suggestions)
    ? payload.suggestions.filter(
        (suggestion): suggestion is string => typeof suggestion === "string",
      )
    : [];
}

export function CardSearch({
  compact = false,
  defaultValue = "",
  id,
}: CardSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/cards/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AutocompleteResponse;
        const nextSuggestions = parseSuggestions(payload);

        setSuggestions(nextSuggestions);
        setActiveIndex(-1);
        setIsOpen(nextSuggestions.length > 0);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function chooseSuggestion(suggestion: string) {
    setQuery(suggestion);
    setSuggestions([]);
    setActiveIndex(-1);
    setIsOpen(false);
    router.push(`/explore?q=${encodeURIComponent(suggestion)}`);
  }

  return (
    <form action="/explore" role="search" className="relative w-full">
      <div
        ref={containerRef}
        className={
          compact
            ? "relative flex h-11 items-center border border-ink/15 bg-night/45 focus-within:border-orange/60"
            : "relative grid border border-orange/25 bg-cream p-1.5 text-night shadow-[12px_12px_0_rgb(230_161_95_/_0.1)] sm:grid-cols-[auto_1fr_auto]"
        }
      >
        <span
          className={
            compact
              ? "grid h-full w-10 shrink-0 place-items-center text-lg text-ink/50"
              : "hidden place-items-center px-4 text-2xl text-night/55 sm:grid"
          }
          aria-hidden="true"
        >
          ⌕
        </span>

        <label htmlFor={id} className="sr-only">
          Search Magic cards
        </label>
        <input
          id={id}
          name="q"
          type="search"
          value={query}
          placeholder={compact ? "Search cards" : "Search a card name or try t:dragon c:red"}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          onChange={(event) => {
            const nextQuery = event.target.value;

            setQuery(nextQuery);
            setIsOpen(nextQuery.trim().length >= 2);

            if (nextQuery.trim().length < 2) {
              setSuggestions([]);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          onBlur={(event) => {
            if (!containerRef.current?.contains(event.relatedTarget)) {
              setIsOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (!isOpen || suggestions.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % suggestions.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex(
                (index) => (index <= 0 ? suggestions.length - 1 : index - 1),
              );
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              chooseSuggestion(suggestions[activeIndex]);
            } else if (event.key === "Escape") {
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          className={
            compact
              ? "min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm text-ink outline-none placeholder:text-ink/45"
              : "min-w-0 bg-transparent px-4 py-4 text-night outline-none placeholder:text-night/45"
          }
        />

        <button
          type="submit"
          className={
            compact
              ? "sr-only"
              : "min-h-12 bg-orange px-7 py-4 font-bold text-night transition hover:brightness-110"
          }
        >
          Explore cards
        </button>

        {isOpen && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Card name suggestions"
            className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-y-auto border border-orange/30 bg-parchment p-1 text-ink shadow-2xl ${
              compact ? "min-w-72" : ""
            }`}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-left text-sm transition ${
                    activeIndex === index
                      ? "bg-orange text-night"
                      : "hover:bg-ink/10"
                  }`}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
