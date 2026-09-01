import Image from "next/image";
import Link from "next/link";

import { CardTile } from "@/components/card-tile";
import { AddToDeckControl } from "@/components/decks/add-to-deck-control";
import type { ResultView } from "@/lib/card-filters";
import type { Card } from "@/types/card";

type CardResultViewsProps = {
  cards: Card[];
  view: ResultView;
};

export function CardResultViews({ cards, view }: CardResultViewsProps) {
  if (view === "detail") {
    return (
      <div id="card-results" className="mt-8 space-y-5">
        {cards.map((card, index) => (
          <article
            key={card.id}
            className="grid gap-5 border border-ink/10 bg-paper/55 p-4 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)_230px]"
          >
            <Link href={`/cards/${card.id}`} className="block self-start">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={`${card.name} card artwork`}
                  width={244}
                  height={340}
                  sizes="160px"
                  unoptimized
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-auto w-full rounded-lg"
                />
              ) : (
                <div className="grid aspect-[488/680] place-items-center rounded-lg bg-forest/45 p-4 text-center text-xs text-ink/70">
                  No image
                </div>
              )}
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">
                    <Link href={`/cards/${card.id}`} className="transition hover:text-orange">
                      {card.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-ink/65">{card.typeLine}</p>
                </div>
                {card.manaCost && <code className="text-sm text-moss">{card.manaCost}</code>}
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/80">
                {card.oracleText || "No Oracle text."}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-orange/90">
                {card.setName} · {card.setCode.toUpperCase()} #{card.collectorNumber}
              </p>
            </div>

            <aside className="border-t border-orange/15 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="mb-3 text-sm text-ink/65">
                {card.priceUsd ? `$${card.priceUsd} estimated` : "Price unavailable"}
              </p>
              <AddToDeckControl card={card} />
            </aside>
          </article>
        ))}
      </div>
    );
  }

  if (view === "compact") {
    return (
      <div id="card-results" className="mt-8 overflow-x-auto border border-ink/10 bg-paper/55">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <caption className="sr-only">Card search results in compact view</caption>
          <thead className="bg-forest/45 text-xs uppercase tracking-[0.1em] text-cream">
            <tr>
              <th scope="col" className="px-4 py-4">Card</th>
              <th scope="col" className="px-4 py-4">Set</th>
              <th scope="col" className="px-4 py-4">Type</th>
              <th scope="col" className="px-4 py-4">MV</th>
              <th scope="col" className="px-4 py-4">USD</th>
              <th scope="col" className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {cards.map((card) => (
              <tr key={card.id} className="align-top transition hover:bg-ink/5">
                <th scope="row" className="px-4 py-4 font-display text-lg">
                  <Link href={`/cards/${card.id}`} className="transition hover:text-orange">
                    {card.name}
                  </Link>
                  {card.manaCost && <code className="mt-1 block text-xs font-normal text-moss">{card.manaCost}</code>}
                </th>
                <td className="px-4 py-4 text-ink/70">
                  {card.setCode.toUpperCase()} #{card.collectorNumber}
                </td>
                <td className="max-w-xs px-4 py-4 text-ink/70">{card.typeLine}</td>
                <td className="px-4 py-4 text-ink/70">{card.manaValue}</td>
                <td className="px-4 py-4 text-moss">
                  {card.priceUsd ? `$${card.priceUsd}` : "—"}
                </td>
                <td className="px-4 py-4">
                  <details>
                    <summary className="cursor-pointer font-bold text-orange">Add to deck</summary>
                    <div className="mt-3 w-56">
                      <AddToDeckControl card={card} />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div id="card-results" className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <CardTile
          key={card.id}
          card={card}
          eager={index === 0}
          actions={<AddToDeckControl card={card} />}
        />
      ))}
    </div>
  );
}
