import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/15 bg-paper">
      <nav
        className="grid h-[76px] grid-cols-[1fr_auto] items-center px-6 md:grid-cols-[1fr_auto_1fr] lg:px-20"
        aria-label="Primary navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-2xl font-bold"
          aria-label="Spellbook home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-lg italic text-cream">
            S
          </span>

          <span>Spellbook</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/#search"
            className="transition-colors hover:text-orange"
          >
            Discover
          </Link>

          <Link
            href="/#browse"
            className="transition-colors hover:text-orange"
          >
            Browse
          </Link>

          <Link
            href="/decks"
            className="transition-colors hover:text-orange"
          >
            Deck Builder
          </Link>
        </div>

        <Link
          href="/decks"
          className="justify-self-end rounded-full border border-ink/15 px-4 py-2 text-sm font-bold transition-colors hover:border-orange hover:text-orange"
        >
          Decks
          <span className="ml-2 inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">
            0
          </span>
        </Link>
      </nav>
    </header>
  );
}
                        
                        