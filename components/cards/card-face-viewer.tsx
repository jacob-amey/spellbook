"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { CardFace } from "@/types/card";

type CardFaceViewerProps = {
  cardName: string;
  fallbackImageUrl: string | null;
  faces: CardFace[];
};

export function CardFaceViewer({
  cardName,
  fallbackImageUrl,
  faces,
}: CardFaceViewerProps) {
  const displayFaces = useMemo(() => {
    const illustratedFaces = faces.filter((face) => face.imageUrl);

    if (illustratedFaces.length > 0) {
      return illustratedFaces;
    }

    return [
      {
        name: cardName,
        imageUrl: fallbackImageUrl,
      },
    ];
  }, [cardName, faces, fallbackImageUrl]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedFace = displayFaces[selectedIndex] ?? displayFaces[0];

  return (
    <div>
      <div className="overflow-hidden rounded-[4.8%] bg-night shadow-[0_28px_90px_rgb(0_0_0_/_0.48)]">
        {selectedFace.imageUrl ? (
          <Image
            src={selectedFace.imageUrl}
            alt={`${selectedFace.name} card face`}
            width={672}
            height={936}
            sizes="(min-width: 1024px) 36vw, 92vw"
            unoptimized
            loading="eager"
            className="h-auto w-full"
          />
        ) : (
          <div className="grid aspect-[488/680] place-items-center bg-forest/45 p-8 text-center text-sm text-ink/70">
            No card image is available for this printing.
          </div>
        )}
      </div>

      {displayFaces.length > 1 && (
        <div
          className="mt-4 grid grid-cols-2 gap-2"
          aria-label="Choose a card face"
        >
          {displayFaces.map((face, index) => (
            <button
              key={`${face.name}:${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-pressed={selectedIndex === index}
              className="min-h-11 border border-ink/20 bg-paper/70 px-4 py-2 text-sm font-bold transition hover:border-orange aria-pressed:border-orange aria-pressed:bg-orange aria-pressed:text-night"
            >
              {face.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
