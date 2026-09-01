import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CardDetailView } from "@/components/cards/card-detail-view";
import { ScryfallApiError } from "@/lib/scryfall";
import {
  getCardById,
  getCardDetailsBundle,
} from "@/lib/scryfall-server";

type CardPageProps = {
  params: Promise<{ cardId: string }>;
};

async function loadCardDetails(cardId: string) {
  try {
    return await getCardDetailsBundle(cardId);
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const { cardId } = await params;

  try {
    const card = await getCardById(cardId);

    return {
      title: `${card.name} | Spellbook`,
      description: `${card.typeLine}. ${card.oracleText}`.slice(0, 155),
      openGraph: {
        title: `${card.name} | Spellbook`,
        description: card.typeLine,
        images: card.imageUrl ? [{ url: card.imageUrl }] : [],
      },
    };
  } catch (error) {
    if (error instanceof ScryfallApiError && error.status === 404) {
      return { title: "Card not found | Spellbook" };
    }

    throw error;
  }
}

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = await params;
  const bundle = await loadCardDetails(cardId);

  return <CardDetailView bundle={bundle} />;
}
