import type { Card } from "@/types/card";
import type { ScryfallColor } from "@/types/scryfall";

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

export const DECK_ZONES = [
  "mainboard",
  "sideboard",
  "commander",
] as const;

export type DeckZone = (typeof DECK_ZONES)[number];

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

export type DeckIssueSeverity = "error" | "warning";

export type DeckIssueCode =
  | "deck-size"
  | "sideboard-size"
  | "illegal-card"
  | "unknown-legality"
  | "copy-limit"
  | "missing-commander"
  | "too-many-commanders"
  | "invalid-commander"
  | "commander-pair"
  | "color-identity"
  | "commander-sideboard"
  | "commander-zone";

export type DeckIssue = {
  id: string;
  severity: DeckIssueSeverity;
  code: DeckIssueCode;
  message: string;
  oracleId?: string;
};

export type DeckTotals = {
  all: number;
  playable: number;
  unique: number;
  mainboard: number;
  sideboard: number;
  commander: number;
};

export type ManaCurveBucket = {
  label: string;
  count: number;
};

export type CardTypeCategory =
  | "Land"
  | "Creature"
  | "Planeswalker"
  | "Instant"
  | "Sorcery"
  | "Artifact"
  | "Enchantment"
  | "Battle"
  | "Other";

export type DeckColorCategory = ScryfallColor | "C";

export type DeckAnalysis = {
  totals: DeckTotals;
  averageManaValue: number;
  manaCurve: ManaCurveBucket[];
  typeCounts: Record<CardTypeCategory, number>;
  colorCounts: Record<DeckColorCategory, number>;
  issues: DeckIssue[];
};
