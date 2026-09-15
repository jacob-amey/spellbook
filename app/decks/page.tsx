import { pageMetadata } from "@/lib/site";
import { DeckDashboard } from "@/components/decks/deck-dashboard";

export const metadata = pageMetadata("MTG Deck Builder | Spellbook", "Build Magic decks with mana-curve statistics, format checks, and JSON backups. Try a sample deck or create your own list, saved locally in your browser.", "/decks");

export default function DecksPage() {
  return (
    <main id="main-content" className="py-8 text-ink sm:py-10">
      <div className="site-container">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Deck builder</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Create and edit deck lists with mana-curve statistics and format checks.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/70">
          Decks are saved in this browser only. Export JSON from the builder to back them up or move them to another device. Clearing site data removes local decks.
        </p>
        <DeckDashboard />
      </div>
    </main>
  );
}
