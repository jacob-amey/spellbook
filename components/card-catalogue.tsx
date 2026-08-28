"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { ScryfallApiError, searchCards } from "@/lib/scryfall";
import type { Card } from "@/types/card";

const CARD_LIMIT = 12;
type CardCatalogueProps = {
  query: string;
};
export default function CardCatalogue({ query }: CardCatalogueProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCards() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const page = await searchCards(query);

        if (ignore) {
          return;
        }

        setCards(page.cards.slice(0, CARD_LIMIT));
        setTotalCards(page.totalCards);
      } catch (error) {
        if (ignore) {
          return;
        }

        setCards([]);
        setTotalCards(0);

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
  }, [query, requestNumber]);

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
          className="mt-5 bg-orange px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
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
      <p className="mt-5 text-sm text-ink/60" aria-live="polite">
        Showing {cards.length} of {totalCards.toLocaleString()}
        {query ? (
          <>
            {" "}
            results for <strong>“{query}”</strong>
          </>
        ) : (
          " matching cards"
        )}
      </p>

      <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.id} className="group">
            {card.imageUrl ? (
              <a
                href={card.scryfallUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${card.name} on Scryfall`}
                className="block"
              >
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  width={488}
                  height={680}
                  unoptimized
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 88vw"
                  className="h-auto w-full rounded-[5%] shadow-[0_12px_28px_rgba(23,34,27,0.18)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(23,34,27,0.24)]"
                />
              </a>
            ) : (
              <div className="grid aspect-[488/680] place-items-center rounded-[5%] bg-ink/10 p-6 text-center text-sm text-ink/55">
                No card image available
              </div>
            )}

            <div className="flex items-start justify-between gap-4 pt-4">
              <div>
                <h3 className="font-display text-xl leading-tight">
                  {card.name}
                </h3>

                <p className="mt-1 text-xs text-ink/55">
                  {card.setName} · {card.setCode.toUpperCase()}
                </p>
              </div>

              <strong className="shrink-0 text-sm">
                {card.priceUsd ? `$${card.priceUsd}` : "No price"}
              </strong>
            </div>

            <p className="mt-2 text-xs text-ink/60">{card.typeLine}</p>
          </article>
        ))}
      </div>
    </>
  );
}
