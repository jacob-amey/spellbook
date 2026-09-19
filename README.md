# Spellbook

A Magic: The Gathering card research and deck-building app built with **Next.js,
React, TypeScript, and Tailwind CSS**. Search the Scryfall archive, compare
printings and rulings, and build decks that survive browser reloads.

**No account, API key, or database setup is needed to try the application.**

![Spellbook homepage with search beside the horizontally scrolling card selection](docs/screenshots/home.png)

[Architecture and tradeoffs](docs/architecture.md) ·
[Testing](docs/testing.md) · [Deployment](docs/deployment.md) ·
[Contributing](CONTRIBUTING.md)

More screenshots: [filtered Explore](docs/screenshots/explore.png) ·
[populated deck workspace](docs/screenshots/deck.png) ·
[mobile Explore](docs/screenshots/mobile-explore.png) ·
[mobile homepage](docs/screenshots/mobile-home.png)

## Try the core workflow

1. Open **Decks → Try a sample deck** to create an editable casual red-blue deck.
2. Change a quantity and inspect the mana curve, card types, and deck checks.
3. Select **Search cards**, choose a color or card type in Explore, and add a
   result to the deck. Filters apply automatically and are encoded in the URL.
4. Reload the deck page to verify persistence. Export JSON for a backup or a text
   list for another deck tool.
5. Open a card to compare Oracle text, legalities, available printings, and rulings.

The sample is a small teaching deck, not a tournament list. Its stored card
snapshots are dated; prices are omitted to avoid presenting old prices as current.


## Features

- A homepage with a 20-card horizontal rail and quick searches.
- An Explore workspace with colors, mana value, types, rarity, formats, rules
  text, artist, set, price, and release-date filters.
- Gallery, detail, and compact views; sorting and explanations of search syntax.
- Card pages with double-faced card support, alternate printings, rulings,
  legality, and marketplace links.
- Multiple decks with rename, format selection, mainboard/sideboard/commander
  zones, quantity edits, removal, and confirmed deletion.
- JSON import and JSON/text export. Arbitrary text-list import is not implemented.
- A sample deck that can be opened and edited without an initial API request.
- Loading, empty, retry, missing-card, and storage-recovery states.

## Project map

```text
app/                  Routes, metadata, loading/error boundaries, autocomplete API
components/           Search, card research, and deck interfaces
lib/                  Card filters, API adapters, deck operations and persistence
types/                Card, deck, account, and upstream API types
tests/                Unit tests and representative API fixtures
e2e/                  Production-browser workflow and accessibility tests
database/schema.sql   Reference PostgreSQL model (not an applied migration)
docs/                 Architecture, test scope, deployment, and backend roadmap
.github/              CI, dependency updates, issue and pull-request templates
```

## Data and acknowledgments

Card data and artwork come from [Scryfall](https://scryfall.com).
Spellbook is independent and is not affiliated with or endorsed by Wizards of
the Coast. Magic: The Gathering and related marks belong to their owners.
Card artwork and third-party data are not original project assets.

The repository does not currently grant an open-source license. Dependency
licenses remain with their respective authors; choose an explicit license for
the original application code before inviting reuse.
