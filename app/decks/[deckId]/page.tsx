import type { Metadata } from "next";

import { DeckEditor } from "@/components/decks/deck-editor";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Deck Workspace | Spellbook",
  description:
    "Edit card quantities, sections, statistics, and deck-building checks.",
};

export default async function DeckPage(
  props: PageProps<"/decks/[deckId]">,
) {
  const { deckId } = await props.params;

  return <DeckEditor deckId={deckId} />;
}
