import type {
  CardTypeCategory,
  Deck,
  DeckAnalysis,
  DeckColorCategory,
  DeckIssue,
  DeckZone,
} from "@/types/deck";
import type { ScryfallColor } from "@/types/scryfall";

const TYPE_CATEGORIES: CardTypeCategory[] = [
  "Land",
  "Creature",
  "Planeswalker",
  "Instant",
  "Sorcery",
  "Artifact",
  "Enchantment",
  "Battle",
  "Other",
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

function countZone(deck: Deck, zone: DeckZone): number {
  return deck.cards
    .filter((entry) => entry.zone === zone)
    .reduce((total, entry) => total + entry.quantity, 0);
}

function categorizeType(typeLine: string): CardTypeCategory {
  return (
    TYPE_CATEGORIES.find(
      (category) =>
        category !== "Other" && typeLine.includes(category),
    ) ?? "Other"
  );
}

function getCustomCopyLimit(oracleText: string): number | null {
  const normalizedText = oracleText.toLowerCase();

  if (
    normalizedText.includes(
      "a deck can have any number of cards named",
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const match = normalizedText.match(
    /a deck can have up to ([a-z]+|\d+) cards named/,
  );

  if (!match) {
    return null;
  }

  const numericLimit = Number(match[1]);

  if (Number.isSafeInteger(numericLimit) && numericLimit > 0) {
    return numericLimit;
  }

  return NUMBER_WORDS[match[1]] ?? null;
}

function isUnlimitedCard(typeLine: string, oracleText: string) {
  return (
    typeLine.includes("Basic Land") ||
    getCustomCopyLimit(oracleText) === Number.POSITIVE_INFINITY
  );
}

function canBeCommander(typeLine: string, oracleText: string) {
  const normalizedText = oracleText.toLowerCase();

  return (
    (typeLine.includes("Legendary") &&
      typeLine.includes("Creature")) ||
    normalizedText.includes("can be your commander") ||
    (typeLine.includes("Legendary") &&
      typeLine.includes("Background"))
  );
}

function hasOnlyCommanderColors(
  cardColors: ScryfallColor[],
  commanderColors: Set<ScryfallColor>,
) {
  return cardColors.every((color) => commanderColors.has(color));
}

function createIssue(
  issue: Omit<DeckIssue, "id"> & { id?: string },
): DeckIssue {
  return {
    ...issue,
    id:
      issue.id ??
      `${issue.code}-${issue.oracleId ?? issue.message}`,
  };
}

function collectValidationIssues(deck: Deck): DeckIssue[] {
  const issues: DeckIssue[] = [];
  const mainboard = countZone(deck, "mainboard");
  const sideboard = countZone(deck, "sideboard");
  const commanderTotal = countZone(deck, "commander");
  const playable = mainboard + commanderTotal;

  if (deck.format === "commander") {
    if (playable !== 100) {
      issues.push(
        createIssue({
          code: "deck-size",
          severity: playable > 100 ? "error" : "warning",
          message: `Commander decks contain 100 cards; this deck currently has ${playable}.`,
        }),
      );
    }

    if (commanderTotal === 0) {
      issues.push(
        createIssue({
          code: "missing-commander",
          severity: "warning",
          message: "Choose a commander for this deck.",
        }),
      );
    } else if (commanderTotal > 2) {
      issues.push(
        createIssue({
          code: "too-many-commanders",
          severity: "error",
          message: "Commander decks can have at most two commanders.",
        }),
      );
    } else if (commanderTotal === 2) {
      issues.push(
        createIssue({
          code: "commander-pair",
          severity: "warning",
          message:
            "Verify that these two commanders have Partner, Background, or another compatible pairing ability.",
        }),
      );
    }

    if (sideboard > 0) {
      issues.push(
        createIssue({
          code: "commander-sideboard",
          severity: "warning",
          message:
            "Commander decks generally do not use a traditional sideboard.",
        }),
      );
    }

    const commanderEntries = deck.cards.filter(
      (entry) => entry.zone === "commander",
    );

    for (const entry of commanderEntries) {
      if (!canBeCommander(entry.card.typeLine, entry.card.oracleText)) {
        issues.push(
          createIssue({
            code: "invalid-commander",
            severity: "error",
            oracleId: entry.card.oracleId,
            message: `${entry.card.name} is not normally eligible to be a commander.`,
          }),
        );
      }
    }

    if (commanderEntries.length > 0) {
      const commanderColors = new Set<ScryfallColor>(
        commanderEntries.flatMap(
          (entry) => entry.card.colorIdentity,
        ),
      );

      for (const entry of deck.cards) {
        if (
          entry.zone !== "commander" &&
          !hasOnlyCommanderColors(
            entry.card.colorIdentity,
            commanderColors,
          )
        ) {
          issues.push(
            createIssue({
              code: "color-identity",
              severity: "error",
              oracleId: entry.card.oracleId,
              message: `${entry.card.name} falls outside the commander's color identity.`,
            }),
          );
        }
      }
    }
  } else if (deck.format !== "casual") {
    if (mainboard < 60) {
      issues.push(
        createIssue({
          code: "deck-size",
          severity: "warning",
          message: `Constructed decks need at least 60 mainboard cards; this deck has ${mainboard}.`,
        }),
      );
    }

    if (sideboard > 15) {
      issues.push(
        createIssue({
          code: "sideboard-size",
          severity: "error",
          message: `Constructed sideboards can contain at most 15 cards; this deck has ${sideboard}.`,
        }),
      );
    }

    if (commanderTotal > 0) {
      issues.push(
        createIssue({
          code: "commander-zone",
          severity: "error",
          message: "Move commander-zone cards into the mainboard for this format.",
        }),
      );
    }
  }

  const entriesByOracleId = new Map<
    string,
    { name: string; quantity: number; typeLine: string; oracleText: string }
  >();

  for (const entry of deck.cards) {
    const current = entriesByOracleId.get(entry.card.oracleId);

    entriesByOracleId.set(entry.card.oracleId, {
      name: entry.card.name,
      quantity: (current?.quantity ?? 0) + entry.quantity,
      typeLine: entry.card.typeLine,
      oracleText: entry.card.oracleText,
    });
  }

  for (const [oracleId, cardSummary] of entriesByOracleId) {
    const representative = deck.cards.find(
      (entry) => entry.card.oracleId === oracleId,
    );

    if (!representative) {
      continue;
    }

    if (deck.format !== "casual") {
      const legality = representative.card.legalities[deck.format];

      if (legality === "banned" || legality === "not_legal") {
        issues.push(
          createIssue({
            code: "illegal-card",
            severity: "error",
            oracleId,
            message: `${cardSummary.name} is not legal in ${deck.format}.`,
          }),
        );
      } else if (!legality) {
        issues.push(
          createIssue({
            code: "unknown-legality",
            severity: "warning",
            oracleId,
            message: `${cardSummary.name} has no saved legality data for ${deck.format}.`,
          }),
        );
      }
    }

    if (deck.format === "casual") {
      continue;
    }

    if (
      isUnlimitedCard(cardSummary.typeLine, cardSummary.oracleText)
    ) {
      continue;
    }

    const legality = representative.card.legalities[deck.format];
    const customLimit = getCustomCopyLimit(cardSummary.oracleText);
    const copyLimit =
      legality === "restricted"
        ? 1
        : customLimit ?? (deck.format === "commander" ? 1 : 4);

    if (cardSummary.quantity > copyLimit) {
      issues.push(
        createIssue({
          code: "copy-limit",
          severity: "error",
          oracleId,
          message: `${cardSummary.name} has ${cardSummary.quantity} copies; this deck allows ${copyLimit}.`,
        }),
      );
    }
  }

  return issues;
}

export function analyzeDeck(deck: Deck): DeckAnalysis {
  const mainboard = countZone(deck, "mainboard");
  const sideboard = countZone(deck, "sideboard");
  const commander = countZone(deck, "commander");
  const playableEntries = deck.cards.filter(
    (entry) => entry.zone !== "sideboard",
  );

  const typeCounts = Object.fromEntries(
    TYPE_CATEGORIES.map((category) => [category, 0]),
  ) as Record<CardTypeCategory, number>;

  const colorCounts: Record<DeckColorCategory, number> = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    C: 0,
  };

  const curveCounts = [0, 0, 0, 0, 0, 0, 0, 0];
  let totalManaValue = 0;
  let nonlandCardCount = 0;

  for (const entry of playableEntries) {
    const typeCategory = categorizeType(entry.card.typeLine);

    typeCounts[typeCategory] += entry.quantity;

    if (entry.card.colorIdentity.length === 0) {
      colorCounts.C += entry.quantity;
    } else {
      for (const color of entry.card.colorIdentity) {
        colorCounts[color] += entry.quantity;
      }
    }

    if (!entry.card.typeLine.includes("Land")) {
      const manaValue = Math.max(0, entry.card.manaValue);
      const curveIndex = Math.min(7, Math.floor(manaValue));

      curveCounts[curveIndex] += entry.quantity;
      totalManaValue += manaValue * entry.quantity;
      nonlandCardCount += entry.quantity;
    }
  }

  return {
    totals: {
      all: mainboard + sideboard + commander,
      playable: mainboard + commander,
      unique: new Set(
        deck.cards.map((entry) => entry.card.oracleId),
      ).size,
      mainboard,
      sideboard,
      commander,
    },
    averageManaValue:
      nonlandCardCount === 0
        ? 0
        : totalManaValue / nonlandCardCount,
    manaCurve: curveCounts.map((count, index) => ({
      label: index === 7 ? "7+" : String(index),
      count,
    })),
    typeCounts,
    colorCounts,
    issues: collectValidationIssues(deck),
  };
}
