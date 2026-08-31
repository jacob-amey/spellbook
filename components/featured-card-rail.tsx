"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ScryfallApiError, loadFeaturedCards } from "@/lib/scryfall";
import type { Card } from "@/types/card";

const FEATURED_CARD_LIMIT = 20;

export function FeaturedCardRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function drawCards() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const page = await loadFeaturedCards();

        if (!ignore) {
          setCards(page.cards.slice(0, FEATURED_CARD_LIMIT));
        }
      } catch (error) {
        if (ignore) {
          return;
        }

        setCards([]);
        setErrorMessage(
          error instanceof ScryfallApiError || error instanceof Error
            ? error.message
            : "The featured cards could not be loaded.",
        );
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void drawCards();

    return () => {
      ignore = true;
    };
  }, [requestNumber]);

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.82, 260),
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return (
      <div
        className="card-rail mt-8 flex gap-5 overflow-hidden"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">Drawing featured cards…</p>

        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="w-[210px] shrink-0 animate-pulse sm:w-[236px]"
          >
            <div className="aspect-[488/680] rounded-2xl bg-ink/10" />
            <div className="mt-4 h-5 w-3/4 rounded bg-ink/10" />
            <div className="mt-2 h-3 w-1/2 rounded bg-ink/10" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        className="mt-8 border border-orange/30 bg-paper/70 p-6"
        role="alert"
      >
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

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink/55" aria-live="polite">
          A fresh selection of {cards.length} cards from Magic’s paper history
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="grid h-10 w-10 place-items-center border border-ink/15 bg-paper/50 text-lg transition hover:border-orange hover:text-orange"
            aria-label="Scroll featured cards left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="grid h-10 w-10 place-items-center border border-ink/15 bg-paper/50 text-lg transition hover:border-orange hover:text-orange"
            aria-label="Scroll featured cards right"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => setRequestNumber((number) => number + 1)}
            className="ml-1 border border-orange/40 bg-orange/10 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.11em] text-orange transition hover:bg-orange hover:text-night"
          >
            Draw 20 new cards
          </button>
        </div>
      </div>

      <ul
        ref={railRef}
        className="card-rail mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6"
        aria-label="Randomly featured Magic cards"
        tabIndex={0}
      >
        {cards.map((card, index) => (
          <li
            key={card.id}
            className="w-[210px] shrink-0 snap-start sm:w-[236px]"
          >
            <article className="group h-full border border-ink/10 bg-paper/55 p-3 transition hover:border-orange/35 hover:bg-paper/80">
              <a
                href={card.scryfallUrl}
                target="_blank"
                rel="noreferrer"
                className="block"
                aria-label={`View ${card.name} on Scryfall`}
              >
                <div className="overflow-hidden rounded-2xl bg-night shadow-[0_14px_35px_rgb(0_0_0_/_0.35)]">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={`${card.name} card artwork`}
                      width={488}
                      height={680}
                      sizes="236px"
                      unoptimized
                      loading={index === 0 ? "eager" : "lazy"}
                      className="h-auto w-full transition duration-300 group-hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="flex aspect-[488/680] items-center justify-center bg-forest/45 px-5 text-center text-sm text-ink/60">
                      No card image available
                    </div>
                  )}
                </div>

                <div className="px-1 pb-1 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl leading-tight transition group-hover:text-orange">
                      {card.name}
                    </h3>
                    {card.priceUsd && (
                      <span className="shrink-0 text-xs text-moss">
                        ${card.priceUsd}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/55">
                    {card.typeLine}
                  </p>
                  <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-orange/75">
                    {card.setName}
                  </p>
                </div>
              </a>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
