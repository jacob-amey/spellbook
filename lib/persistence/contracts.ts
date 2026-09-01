import type { AuthSession } from "@/types/account";
import type { Deck } from "@/types/deck";

export type DeckRepository = {
  listByOwner(ownerId: string): Promise<Deck[]>;
  findById(ownerId: string, deckId: string): Promise<Deck | null>;
  save(ownerId: string, deck: Deck): Promise<Deck>;
  remove(ownerId: string, deckId: string): Promise<boolean>;
};

export type SessionGateway = {
  getCurrentSession(): Promise<AuthSession | null>;
  requireCurrentSession(): Promise<AuthSession>;
};

export type ApplicationServices = {
  decks: DeckRepository;
  sessions: SessionGateway;
};
