import type { Card } from "@/types/card";

export const DECK_FORMATS = [
  "commander",
  "standard",
  "modern",
  "pioneer",
  "pauper",
  "legacy",
  "vintage",
  "casual",
] as const;

export type DeckFormat = (typeof DECK_FORMATS)[number];

export type DeckZone =
  | "mainboard"
  | "sideboard"
  | "commander";

export type DeckEntry = {
  card: Card;
  quantity: number;
  zone: DeckZone;
};

export type Deck = {
  id: string;
  name: string;
  format: DeckFormat;
  cards: DeckEntry[];
  createdAt: string;
  updatedAt: string;
};
