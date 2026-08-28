import Image from "next/image";

import type { Card } from "@/types/card";

type CardTileProps = {
  card: Card;
  eager?: boolean;
};

export function CardTile({
  card,
  eager = false,
}: CardTileProps) {
  return (
    <article className="group">
      <a
        href={card.scryfallUrl}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <div className="overflow-hidden rounded-2xl bg-black/10 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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
            <div className="flex aspect-[488/680] items-center justify-center bg-stone-200 px-6 text-center text-sm text-stone-600">
              No card image available
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl font-semibold">
              {card.name}
            </h3>

            {card.manaCost && (
              <span className="shrink-0 text-sm text-stone-600">
                {card.manaCost}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-stone-600">
            {card.typeLine}
          </p>

          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
            {card.setName}
          </p>
        </div>
      </a>
    </article>
  );
}