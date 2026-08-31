"use client";

import { useEffect, useState } from "react";
import { CardTile } from "@/components/card-tile";
import { AddToDeckControl } from "@/components/decks/add-to-deck-control";

import {
  ScryfallApiError,
  loadNextCardPage,
  searchCards,
} from "@/lib/scryfall";
import type { ScryfallSortOrder } from "@/lib/scryfall";
import type { Card } from "@/types/card";

const CARD_BATCH_SIZE = 12;

type CardCatalogueProps = {
  query: string;
  sortOrder?: ScryfallSortOrder;
};

export default function CardCatalogue({
  query,
  sortOrder = "name",
}: CardCatalogueProps) {
  const isFeaturedSelection = query.trim().length === 0;
  const [cards, setCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCards() {
      setIsLoading(true);
      setErrorMessage(null);
      setLoadMoreError(null);

      try {
        const page = await searchCards(query, sortOrder);

        if (ignore) {
          return;
        }

        setCards(page.cards);
        setTotalCards(page.totalCards);
        setHasMore(page.hasMore);
        setNextPage(page.nextPage);
        setWarnings(page.warnings);
        setVisibleCount(CARD_BATCH_SIZE);
      } catch (error) {
        if (ignore) {
          return;
        }

        setCards([]);
        setTotalCards(0);
        setHasMore(false);
        setNextPage(null);
        setWarnings([]);
        setVisibleCount(CARD_BATCH_SIZE);

        if (
          error instanceof ScryfallApiError &&
          error.status === 404 &&
          error.code === "not_found"
        ) {
          setErrorMessage(null);
        } else {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The card catalogue could not be loaded.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      ignore = true;
    };
  }, [query, requestNumber, sortOrder]);

  const visibleCards = cards.slice(0, visibleCount);
  const hasHiddenCards = visibleCount < cards.length;
  const canLoadMore = hasHiddenCards || (hasMore && nextPage !== null);

  async function handleLoadMore() {
    setLoadMoreError(null);

    if (hasHiddenCards) {
      setVisibleCount((currentCount) =>
        Math.min(currentCount + CARD_BATCH_SIZE, cards.length),
      );

      return;
    }

    if (!hasMore || !nextPage || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const page = await loadNextCardPage(nextPage);

      setCards((currentCards) => [...currentCards, ...page.cards]);

      setVisibleCount(
        (currentCount) =>
          currentCount + Math.min(CARD_BATCH_SIZE, page.cards.length),
      );

      setHasMore(page.hasMore);
      setNextPage(page.nextPage);

      setWarnings((currentWarnings) =>
        Array.from(new Set([...currentWarnings, ...page.warnings])),
      );
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : "More cards could not be loaded.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return (
      <div
        className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">Loading cards...</p>

        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[488/680] rounded-[5%] bg-ink/10" />
            <div className="mt-4 h-5 w-2/3 rounded bg-ink/10" />
            <div className="mt-2 h-3 w-1/2 rounded bg-ink/10" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-9 border border-orange/30 bg-paper p-6" role="alert">
        <h3 className="font-display text-2xl">The archive is unavailable</h3>

        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/65">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() => setRequestNumber((number) => number + 1)}
          className="mt-5 bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mt-9 border border-ink/10 bg-paper p-6" role="status">
        <h3 className="font-display text-2xl">No cards found</h3>

        <p className="mt-2 text-sm text-ink/65">
          {query
            ? `No cards matched "${query}". Try another name or term.`
            : "The catalogue did not return any cards."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-ink/60" aria-live="polite">
          {isFeaturedSelection ? (
            <>
              Showing {visibleCards.length} randomly drawn cards from the
              paper archive
            </>
          ) : (
            <>
              Showing {visibleCards.length} of {totalCards.toLocaleString()}{" "}
              matching cards
            </>
          )}
        </p>

        {isFeaturedSelection && (
          <button
            type="button"
            onClick={() => setRequestNumber((number) => number + 1)}
            className="shrink-0 border border-orange/45 bg-orange/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-orange transition hover:bg-orange hover:text-night"
          >
            Draw another selection
          </button>
        )}
      </div>

      {warnings.length > 0 && (
        <aside
          className="mt-6 border border-orange/30 bg-paper p-5"
          aria-label="Search warnings"
        >
          <h3 className="font-display text-xl">Search notes</h3>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink/65">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </aside>
      )}

      <div
        id="card-results"
        className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleCards.map((card, index) => (
          <CardTile
            key={card.id}
            card={card}
            eager={index === 0}
            actions={<AddToDeckControl card={card} />}
          />
        ))}
      </div>

      <div
        className="mt-12 flex flex-col items-center gap-3"
        aria-busy={isLoadingMore}
      >
        {loadMoreError && (
          <p className="text-sm text-orange" role="alert">
            {loadMoreError}
          </p>
        )}

        {canLoadMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            aria-controls="card-results"
            className="bg-forest px-6 py-3 text-sm font-bold text-cream transition hover:bg-fern disabled:cursor-wait disabled:opacity-60"
          >
            {isLoadingMore ? "Loading more cards..." : "Load more cards"}
          </button>
        )}
      </div>
    </>
  );
}
