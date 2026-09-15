import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-parchment/20 py-6 text-ink/60">
      <div className="site-container flex flex-col gap-4 text-xs leading-5 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl">
          Spellbook is an independent project and is not affiliated
          with or endorsed by Wizards of the Coast.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center transition-colors hover:text-moss"
          >
            Card data from Scryfall ↗
          </a>
          <Link href="/explore" className="inline-flex min-h-9 items-center transition-colors hover:text-moss">
            Explore cards
          </Link>
          <Link href="/decks" className="inline-flex min-h-9 items-center transition-colors hover:text-moss">
            Build a deck
          </Link>
        </div>
      </div>
    </footer>
  );
}
