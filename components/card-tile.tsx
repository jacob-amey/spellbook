import Image from "next/image";
import Link from "next/link";
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
    <article className="group flex h-full min-w-0 flex-col rounded-xl border border-ink/10 bg-parchment/50 p-3 shadow-sm transition-colors hover:border-ink/25 hover:bg-parchment/80">
      <Link
        href={`/cards/${card.id}`}
        prefetch={false}
        className="block rounded-lg"
        aria-label={`View details for ${card.name}`}
      >
        <div className="overflow-hidden rounded-lg bg-night ring-1 ring-white/10">
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
      </Link>

      <div className="mt-4 flex grow flex-col">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <h3 className="min-w-0 text-sm font-semibold leading-5">
            <Link
              href={`/cards/${card.id}`}
              prefetch={false}
              className="transition-colors hover:text-moss"
            >
              {card.name}
            </Link>
          </h3>

          {card.manaCost && (
            <span className="text-xs leading-5 tabular-nums text-ink/60">
              {card.manaCost}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs leading-5 text-ink/65">
          {card.typeLine}
        </p>

        <p className="mt-1 text-xs leading-5 text-ink/60">
          {card.setName}
        </p>

        {actions && (
          <div className="mt-4 border-t border-ink/10 pt-3">
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
