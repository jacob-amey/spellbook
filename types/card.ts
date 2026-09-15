import type {
  ScryfallColor,
  ScryfallLegality,
} from "@/types/scryfall";

export type CardFace = {
  name: string;
  manaCost: string;
  typeLine: string;
  oracleText: string;
  flavorText: string;
  artist: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  imageUrl: string | null;
};

export type CardPrices = {
  usd: string | null;
  usdFoil: string | null;
  usdEtched: string | null;
  eur: string | null;
  eurFoil: string | null;
  tix: string | null;
};

export type CardPurchaseUris = {
  tcgplayer: string | null;
  cardmarket: string | null;
  cardhoarder: string | null;
};

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

export type CardDetails = Card & {
  rarity: string;
  language: string;
  layout: string;
  setType: string;
  flavorText: string;
  loyalty: string | null;
  printedName: string | null;
  printedText: string | null;
  printedTypeLine: string | null;
  cardFaces: CardFace[];
  prices: CardPrices;
  finishes: string[];
  foil: boolean;
  nonfoil: boolean;
  promo: boolean;
  purchaseUris: CardPurchaseUris;
};

export type CardRuling = {
  id: string;
  publishedAt: string;
  source: string;
  comment: string;
};

export type CardDetailsBundle = {
  card: CardDetails;
  printings: { cards: CardDetails[]; totalCards: number } | null;
  rulings: CardRuling[] | null;
};
