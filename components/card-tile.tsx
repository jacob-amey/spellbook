import Image from "next/image";
import type { ReactNode } from "react";

import type { Card } from "@/types/card";

type CardTileProps = {
  card: Card;
  eager?: boolean;
  actions?: ReactNode;
};

export function CardTile({
  card,
  eager = false,
  actions,
}: CardTileProps) {
  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-paper/55 p-3 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)] transition duration-300 hover:border-orange/30 hover:bg-paper/80">
      <a
        href={card.scryfallUrl}
        target="_blank"
        rel="noreferrer"
        className="block"
        aria-label={`View ${card.name} on Scryfall`}
      >
        <div className="overflow-hidden rounded-2xl bg-night shadow-[0_14px_35px_rgb(0_0_0_/_0.35)] transition duration-300 group-hover:-translate-y-1">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={`${card.name} card artwork`}
              width={488}
              height={680}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
              unoptimized
              loading={eager ? "eager" : "lazy"}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex aspect-[488/680] items-center justify-center bg-forest/45 px-6 text-center text-sm text-ink/60">
              No card image available
            </div>
          )}
        </div>
      </a>

      <div className="mt-4 flex grow flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-semibold">
            <a
              href={card.scryfallUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-orange"
            >
              {card.name}
            </a>
          </h3>

          {card.manaCost && (
            <span className="shrink-0 text-sm text-ink/60">
              {card.manaCost}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-ink/60">
          {card.typeLine}
        </p>

        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-moss/80">
          {card.setName}
        </p>

        {actions && (
          <div className="mt-4 border-t border-orange/15 pt-4">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
