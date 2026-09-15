"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Form from "next/form";

type CardSearchProps = {
  compact?: boolean;
  defaultValue?: string;
  id: string;
};

type AutocompleteResponse = {
  suggestions?: unknown;
};

function parseSuggestions(payload: AutocompleteResponse | null): string[] {
  return Array.isArray(payload?.suggestions)
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
  const focusedRef = useRef(false);
  const dismissedRef = useRef(false);
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen, listboxId]);

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
        if (controller.signal.aborted) return;

        setSuggestions(nextSuggestions);
        setActiveIndex(-1);
        setIsOpen(focusedRef.current && !dismissedRef.current && nextSuggestions.length > 0);
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
    dismissedRef.current = true;
    setQuery(suggestion);
    setSuggestions([]);
    setActiveIndex(-1);
    setIsOpen(false);
    router.push(`/explore?q=${encodeURIComponent(suggestion)}`);
  }

  return (
    <Form action="/explore" role="search" aria-label={compact ? "Quick card search" : "Card catalogue search"} className="relative w-full" onSubmit={() => {
      dismissedRef.current = true;
      setIsOpen(false);
      setActiveIndex(-1);
    }}>
      <div
        className={
          compact
            ? "card-search-field relative flex h-11 items-center rounded-md border border-ink/15 bg-parchment/50 transition"
            : "card-search-field relative grid grid-cols-[minmax(0,1fr)_auto] rounded-lg border border-ink/25 bg-parchment p-1.5 text-ink shadow-sm transition sm:grid-cols-[auto_minmax(0,1fr)_auto]"
        }
      >
        <span
          className={
            compact
              ? "grid h-full w-10 shrink-0 place-items-center text-lg text-ink/50"
              : "hidden place-items-center px-3 text-2xl text-ink/60 sm:grid"
          }
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
        </span>

        <label htmlFor={id} className="sr-only">
          Search Magic cards
        </label>
        <input
          id={id}
          name="q"
          type="search"
          value={query}
          placeholder={compact ? "Search cards" : "Card name or query"}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          onChange={(event) => {
            const nextQuery = event.target.value;

            setQuery(nextQuery);
            dismissedRef.current = false;
            setIsOpen(false);
            setSuggestions([]);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            focusedRef.current = true;
            dismissedRef.current = false;
            setIsOpen(suggestions.length > 0);
          }}
          onBlur={() => {
            focusedRef.current = false;
            setIsOpen(false);
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
              event.preventDefault();
              dismissedRef.current = true;
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          className={
            compact
              ? "min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm text-ink outline-none placeholder:text-ink/45"
              : "min-w-0 bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink/60"
          }
        />

        <button
          type="submit"
          className={
            compact
              ? "grid h-11 w-11 shrink-0 place-items-center rounded-r-md text-ink/65 transition hover:text-moss focus-visible:outline-offset-0"
              : "min-h-11 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-night shadow-sm transition-colors hover:bg-moss/85 active:bg-moss/75"
          }
        >
          {compact ? <><span aria-hidden="true">→</span><span className="sr-only">Search</span></> : "Search"}
        </button>

        {isOpen && suggestions.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Card name suggestions"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-y-auto rounded-md border border-ink/20 bg-parchment p-1 text-ink shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                role="presentation"
              >
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-left text-sm transition ${
                    activeIndex === index
                      ? "bg-moss/15 text-ink"
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
    </Form>
  );
}
