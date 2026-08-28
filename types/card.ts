import type{
    ScryfallColor,
    ScryfallLegality,
} from "@/types/scryfall";

export type Card = {
  id: string;
  oracleId: string;
  name: string;

  setCode: string;
  setName: string;
  collectorNumber: string;
  releasedAt: string;

  manaCost: string;
  manaValue: number;
  typeLine: string;
  oracleText: string;

  power: string | null;
  toughness: string | null;
  keywords: string[];

  colorIdentity: ScryfallColor[];
  legalities: Record<string, ScryfallLegality>;

  imageUrl: string | null;
  priceUsd: string | null;

  artist: string | null;
  scryfallUrl: string;
};

export type CardSearchPage = {
  cards: Card[];
  totalCards: number;
  hasMore: boolean;
  nextPage: string | null;
  warnings: string[];
};