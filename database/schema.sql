-- PostgreSQL reference schema for the planned account-backed persistence layer.
-- Browser-local decks remain the active implementation until an adapter is added.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE decks (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL CHECK (length(trim(name)) > 0),
  format TEXT NOT NULL CHECK (
    format IN (
      'commander', 'standard', 'modern', 'pioneer',
      'pauper', 'legacy', 'vintage', 'casual'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deck_cards (
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  oracle_id TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('mainboard', 'sideboard', 'commander')),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 999),
  card_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (deck_id, oracle_id, zone)
);

CREATE INDEX decks_owner_updated_idx ON decks (owner_id, updated_at DESC);
CREATE INDEX deck_cards_deck_idx ON deck_cards (deck_id);
