# Spellbook

Spellbook is a responsive Magic: The Gathering discovery and deck-building
application built with Next.js, React, TypeScript, and Tailwind CSS.

It combines live card data from the Scryfall API with a browser-based deck
workspace. The project is designed to demonstrate production-oriented frontend
engineering: typed external data, URL-driven search state, reusable components,
local persistence, domain validation, automated testing, accessibility, and
continuous integration.

## Features

- A randomized 20-card homepage rail with keyboard and touch scrolling
- Card-name autocomplete in the homepage and desktop navigation
- A dedicated Explore page with shareable, validated URL filters
- Filters for name, Oracle text, keyword, color relationship, mana value, type,
  subtype, rarity, format, set, artist, price, and release window
- Sorting by name, release date, mana value, rarity, color, price, or EDHREC rank
- Gallery, detailed, and compact result views with card- or printing-level results
- A readable explanation of every generated Scryfall search term
- Paginated Scryfall results with loading, empty, warning, and error states
- First-party card pages with Oracle and printed text, rulings, legalities, prices,
  marketplace links, alternate printings, and double-faced card support
- Reusable card results with direct add-to-deck controls
- Multiple locally saved decks with rename, format, zone, and quantity management
- Mana-curve, card-type, and color-identity analysis
- Format and Commander color-identity validation
- JSON and text import/export
- Responsive dark interface with keyboard focus and reduced-motion support
- Unit tests, coverage thresholds, type checking, linting, and GitHub Actions CI
- PostgreSQL schema, repository contracts, and environment validation prepared
  for a future account-backed persistence milestone

## Routes

- `/` — focused homepage, global search entry, and randomized card rail
- `/explore` — randomized grid, advanced filters, sorting, and search results
- `/cards/[cardId]` — detailed card research, rulings, printings, and prices
- `/decks` — saved deck dashboard
- `/decks/[deckId]` — complete deck editor and analysis workspace
- `/api/cards/autocomplete` — same-origin card-name suggestion endpoint

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vitest with V8 coverage
- Scryfall REST API
- Browser `localStorage` for device-local deck persistence

## Local development

This project expects the Node version declared in [`.nvmrc`](./.nvmrc).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run check
npm run test:coverage
npm run build
```

`npm run check` runs ESLint, TypeScript, and the unit test suite. The same
checks run in continuous integration.

## Architecture notes

- Card API response types live in `types/scryfall.ts`.
- `lib/scryfall.ts` owns Scryfall requests, normalization, pagination, sorting,
  and randomized page selection.
- `lib/scryfall-server.ts` owns cached server-side detail, ruling, printing, and
  autocomplete requests.
- `lib/card-filters.ts` validates URL parameters and translates interface
  filters into Scryfall search syntax.
- Deck domain behavior is separated into operations, analysis, and serialization
  modules under `lib/`.
- React context provides browser-local deck state to search and deck routes.
- `lib/persistence/contracts.ts`, `database/schema.sql`, and
  `docs/backend-readiness.md` define the safe path to server persistence and login.

## Future backend configuration

The deployed demo does not require a database or login. The included backend
files establish an intentional upgrade path without shipping incomplete account
features. See [`docs/backend-readiness.md`](./docs/backend-readiness.md) before
setting any variables. Example names live in [`.env.example`](./.env.example);
real values belong only in an ignored `.env.local` file or a deployment secret
manager.

## Data and trademarks

Card data and images are provided by [Scryfall](https://scryfall.com).
Spellbook is an independent educational project and is not affiliated with or
endorsed by Wizards of the Coast. Magic: The Gathering and its related marks
belong to their respective owners.
