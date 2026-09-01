import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-orange/15 bg-paper/90 px-6 py-8 text-ink/65 lg:px-[7vw]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Spellbook is an independent learning project and is not affiliated
          with or endorsed by Wizards of the Coast.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-orange"
          >
            Card data from Scryfall ↗
          </a>
          <Link href="/explore" className="transition hover:text-orange">
            Explore cards
          </Link>
          <Link href="/decks" className="transition hover:text-orange">
            Build a deck
          </Link>
        </div>
      </div>
    </footer>
  );
}
