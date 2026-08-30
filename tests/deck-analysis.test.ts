import { describe, expect, it } from "vitest";

import { analyzeDeck } from "@/lib/deck-analysis";
import {
  createCard,
  createDeck,
  createEntry,
} from "@/tests/deck-fixtures";

function issueCodes(deck: ReturnType<typeof createDeck>) {
  return analyzeDeck(deck).issues.map((issue) => issue.code);
}

describe("deck statistics", () => {
  it("returns empty statistics for an empty deck", () => {
    const analysis = analyzeDeck(createDeck());

    expect(analysis.totals).toEqual({
      all: 0,
      playable: 0,
      unique: 0,
      mainboard: 0,
      sideboard: 0,
      commander: 0,
    });
    expect(analysis.averageManaValue).toBe(0);
    expect(analysis.issues).toEqual([]);
  });

  it("calculates zones, card types, colors, and mana curve", () => {
    const redInstant = createCard();
    const blueRedCreature = createCard({
      id: "printing-multicolor-creature",
      oracleId: "oracle-multicolor-creature",
      name: "Prism Mage",
      manaCost: "{1}{U}{R}",
      manaValue: 3,
      typeLine: "Creature — Human Wizard",
      colorIdentity: ["U", "R"],
    });
    const wastes = createCard({
      id: "printing-wastes",
      oracleId: "oracle-wastes",
      name: "Wastes",
      manaCost: "",
      manaValue: 0,
      typeLine: "Basic Land — Wastes",
      oracleText: "{T}: Add {C}.",
      colorIdentity: [],
    });
    const expensiveArtifact = createCard({
      id: "printing-expensive-artifact",
      oracleId: "oracle-expensive-artifact",
      name: "Sideboard Colossus",
      manaCost: "{8}",
      manaValue: 8,
      typeLine: "Artifact Creature — Golem",
      colorIdentity: [],
    });
    const deck = createDeck({
      cards: [
        createEntry(redInstant, 2),
        createEntry(blueRedCreature, 1),
        createEntry(wastes, 3),
        createEntry(expensiveArtifact, 1, "sideboard"),
      ],
    });

    const analysis = analyzeDeck(deck);

    expect(analysis.totals).toEqual({
      all: 7,
      playable: 6,
      unique: 4,
      mainboard: 6,
      sideboard: 1,
      commander: 0,
    });
    expect(analysis.averageManaValue).toBeCloseTo(5 / 3);
    expect(analysis.manaCurve[1].count).toBe(2);
    expect(analysis.manaCurve[3].count).toBe(1);
    expect(analysis.manaCurve[7].count).toBe(0);
    expect(analysis.typeCounts).toMatchObject({
      Creature: 1,
      Instant: 2,
      Land: 3,
    });
    expect(analysis.colorCounts).toMatchObject({
      U: 1,
      R: 3,
      C: 3,
    });
  });

  it("groups mana values of seven or more into the last bucket", () => {
    const card = createCard({
      manaValue: 9,
      typeLine: "Artifact",
      colorIdentity: [],
    });

    const analysis = analyzeDeck(
      createDeck({ cards: [createEntry(card, 2)] }),
    );

    expect(analysis.manaCurve[7]).toEqual({
      label: "7+",
      count: 2,
    });
  });
});

describe("constructed deck checks", () => {
  it("reports deck size, legality, and copy-limit problems", () => {
    const illegalCard = createCard({
      legalities: {
        standard: "not_legal",
      },
    });
    const deck = createDeck({
      format: "standard",
      cards: [createEntry(illegalCard, 5)],
    });

    expect(issueCodes(deck)).toEqual(
      expect.arrayContaining([
        "deck-size",
        "illegal-card",
        "copy-limit",
      ]),
    );
  });

  it("allows any number of basic lands", () => {
    const basicLand = createCard({
      id: "printing-island",
      oracleId: "oracle-island",
      name: "Island",
      manaCost: "",
      manaValue: 0,
      typeLine: "Basic Land — Island",
      oracleText: "({T}: Add {U}.)",
      colorIdentity: ["U"],
      legalities: { standard: "legal" },
    });
    const deck = createDeck({
      format: "standard",
      cards: [createEntry(basicLand, 60)],
    });

    expect(issueCodes(deck)).not.toContain("copy-limit");
    expect(issueCodes(deck)).not.toContain("deck-size");
  });

  it("honors card-specific copy limits", () => {
    const sevenDwarves = createCard({
      id: "printing-seven-dwarves",
      oracleId: "oracle-seven-dwarves",
      name: "Seven Dwarves",
      typeLine: "Creature — Dwarf",
      oracleText:
        "A deck can have up to seven cards named Seven Dwarves.",
      legalities: { modern: "legal" },
    });

    const validDeck = createDeck({
      format: "modern",
      cards: [
        createEntry(sevenDwarves, 7),
        createEntry(
          createCard({
            id: "printing-filler-land",
            oracleId: "oracle-filler-land",
            name: "Mountain",
            typeLine: "Basic Land — Mountain",
            colorIdentity: ["R"],
            legalities: { modern: "legal" },
          }),
          53,
        ),
      ],
    });
    const invalidDeck = createDeck({
      ...validDeck,
      cards: [
        createEntry(sevenDwarves, 8),
        createEntry(validDeck.cards[1].card, 52),
      ],
    });

    expect(issueCodes(validDeck)).not.toContain("copy-limit");
    expect(issueCodes(invalidDeck)).toContain("copy-limit");
  });

  it("keeps casual decks rule-light", () => {
    const card = createCard({
      legalities: { modern: "banned" },
    });
    const deck = createDeck({
      format: "casual",
      cards: [createEntry(card, 20)],
    });

    expect(analyzeDeck(deck).issues).toEqual([]);
  });
});

describe("commander deck checks", () => {
  it("reports an empty command zone and incomplete deck size", () => {
    const codes = issueCodes(
      createDeck({ format: "commander" }),
    );

    expect(codes).toContain("deck-size");
    expect(codes).toContain("missing-commander");
  });

  it("checks commander eligibility and singleton quantities", () => {
    const lightningBolt = createCard({
      legalities: { commander: "legal" },
    });
    const deck = createDeck({
      format: "commander",
      cards: [createEntry(lightningBolt, 2, "commander")],
    });

    const codes = issueCodes(deck);

    expect(codes).toContain("invalid-commander");
    expect(codes).toContain("copy-limit");
  });

  it("checks cards against the commander's color identity", () => {
    const blueCommander = createCard({
      id: "printing-blue-commander",
      oracleId: "oracle-blue-commander",
      name: "Blue Commander",
      manaCost: "{2}{U}",
      manaValue: 3,
      typeLine: "Legendary Creature — Human Wizard",
      colorIdentity: ["U"],
      legalities: { commander: "legal" },
    });
    const redCard = createCard({
      legalities: { commander: "legal" },
    });
    const deck = createDeck({
      format: "commander",
      cards: [
        createEntry(blueCommander, 1, "commander"),
        createEntry(redCard, 1),
      ],
    });

    expect(issueCodes(deck)).toContain("color-identity");
    expect(issueCodes(deck)).not.toContain("invalid-commander");
  });
});
