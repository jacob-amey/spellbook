"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  ScryfallApiError,
  loadFeaturedCards,
  shuffleCards,
} from "@/lib/scryfall";
import type { Card } from "@/types/card";
import { Icon } from "@/components/ui/icon";

const FEATURED_CARD_LIMIT = 20;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

let featuredCardPool: Card[] | null = null;
let featuredCardPoolRequest: Promise<Card[]> | null = null;

function getFeaturedCardPool(): Promise<Card[]> {
  if (featuredCardPool) {
    return Promise.resolve(featuredCardPool);
  }

  if (!featuredCardPoolRequest) {
    featuredCardPoolRequest = loadFeaturedCards()
      .then((page) => {
        featuredCardPool = page.cards;

        return page.cards;
      })
      .finally(() => {
        featuredCardPoolRequest = null;
      });
  }

  return featuredCardPoolRequest;
}

function drawFromPool(pool: Card[], previousCards: Card[] = []): Card[] {
  const previousIds = new Set(previousCards.map((card) => card.id));
  const unseenCards = shuffleCards(
    pool.filter((card) => !previousIds.has(card.id)),
  );
  const previousSelection = shuffleCards(
    pool.filter((card) => previousIds.has(card.id)),
  );

  return [...unseenCards, ...previousSelection].slice(0, FEATURED_CARD_LIMIT);
}

export function FeaturedCardRail() {
  const railRef = useRef<HTMLUListElement>(null);
  const [cards, setCards] = useState<Card[]>(() =>
    featuredCardPool ? drawFromPool(featuredCardPool) : [],
  );
  const [isLoading, setIsLoading] = useState(featuredCardPool === null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function drawCards() {
      try {
        const pool = await getFeaturedCardPool();

        if (!ignore) {
          setCards((currentCards) => drawFromPool(pool, currentCards));
          setErrorMessage(null);
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

  function drawCards() {
    if (!featuredCardPool) {
      setIsLoading(true);
      setRequestNumber((number) => number + 1);

      return;
    }

    setCards((currentCards) =>
      drawFromPool(featuredCardPool ?? [], currentCards),
    );
    railRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });
  }

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.82, 260),
      behavior: scrollBehavior(),
    });
  }

  if (isLoading) {
    return (
      <div
        className="card-rail mt-6 flex gap-5 overflow-hidden"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">Loading featured cards…</p>

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
        <h3 className="text-2xl font-semibold">Card search is unavailable</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink/65">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={drawCards}
          className="mt-5 bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-ink/10 py-3">
        <p className="text-xs tabular-nums text-ink/60" aria-live="polite">
          {cards.length} cards · Paper printings
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRail(-1)}
            className="grid h-11 w-11 place-items-center rounded-md border border-ink/15 bg-paper/50 text-ink/70 transition-colors hover:border-moss/40 hover:bg-ink/5 hover:text-ink"
            aria-label="Scroll featured cards left"
          >
            <Icon name="arrow-left" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail(1)}
            className="grid h-11 w-11 place-items-center rounded-md border border-ink/15 bg-paper/50 text-ink/70 transition-colors hover:border-moss/40 hover:bg-ink/5 hover:text-ink"
            aria-label="Scroll featured cards right"
          >
            <Icon name="arrow-right" />
          </button>
          <button
            type="button"
            onClick={drawCards}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-moss transition-colors hover:bg-moss/10"
          >
            <Icon name="shuffle" /> Shuffle selection
          </button>
        </div>
      </div>

      <ul
        ref={railRef}
        className="card-rail mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5"
        aria-label="Randomly featured Magic cards"
        tabIndex={0}
      >
        {cards.map((card, index) => (
          <li
            key={card.id}
            className="w-[210px] shrink-0 snap-start sm:w-[236px]"
          >
            <article className="group h-full">
              <Link
                href={`/cards/${card.id}`}
                prefetch={false}
                className="block rounded-lg"
                aria-label={`View details for ${card.name}`}
              >
                <div className="overflow-hidden rounded-xl bg-night shadow-md ring-1 ring-white/10 transition-shadow group-hover:ring-moss/40">
                  {card.imageUrl ? (
                    <Image
                      src={card.imageUrl}
                      alt={`${card.name} card artwork`}
                      width={488}
                      height={680}
                      sizes="236px"
                      unoptimized
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="h-auto w-full"
                    />
                  ) : (
                    <div className="flex aspect-[488/680] items-center justify-center bg-forest/45 px-5 text-center text-sm text-ink/60">
                      No card image available
                    </div>
                  )}
                </div>

                <div className="pb-1 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-sm font-medium leading-5 transition group-hover:text-moss">
                      {card.name}
                    </h3>
                    {card.priceUsd && (
                      <span className="shrink-0 rounded bg-ink/5 px-1.5 py-0.5 text-xs tabular-nums text-ink/75">
                        ${card.priceUsd}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-ink/60">
                    {card.typeLine}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs leading-5 text-ink/60">
                    {card.setName}
                  </p>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
