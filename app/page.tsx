export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="grid h-[76px] grid-cols-[1fr_auto] items-center border-b border-ink/15 px-6 md:grid-cols-[1fr_auto_1fr] lg:px-20">
        <a
          href="#top"
          className="flex items-center gap-3 font-display text-2xl font-bold"
          aria-label="Spellbook home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-lg italic text-cream">
            S
          </span>
          <span>Spellbook</span>
        </a>

        <div className="hidden items-stretch gap-9 self-stretch text-sm md:flex">
          <a
            href="#search"
            className="flex items-center border-b-[3px] border-orange pt-[3px] font-bold"
          >
            Discover
          </a>

          <a
            href="#browse"
            className="flex items-center border-b-[3px] border-transparent pt-[3px]"
          >
            Browse
          </a>

          <a
            href="#about"
            className="flex items-center border-b-[3px] border-transparent pt-[3px]"
          >
            About
          </a>
        </div>

        <button
          type="button"
          className="justify-self-end rounded-full border border-ink/15 px-4 py-2 text-sm font-bold"
        >
          ♡ Saved
          <span className="ml-2 inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">
            0
          </span>
        </button>
      </nav>

      <section
        id="top"
        className="relative grid gap-14 overflow-hidden px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-[7vw] lg:py-28"
      >
        <span
          className="absolute right-[5%] top-[8%] text-5xl text-orange"
          aria-hidden="true"
        >
          ✦
        </span>

        <div>
          <p className="mb-4 text-[11px] font-extrabold tracking-[0.19em] text-ink/60">
            THE MULTIVERSE, CATALOGUED
          </p>

          <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Find the card.
            <br />
            <em className="font-medium text-orange">Know the magic.</em>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">
            Search every Magic: The Gathering card ever printed. Explore art,
            rulings, formats, and prices in one carefully organized place.
          </p>
        </div>

        <div
          id="search"
          role="search"
          className="bg-forest p-5 text-white shadow-[12px_12px_0_#e9dfcc] sm:p-7 sm:shadow-[18px_18px_0_#e9dfcc]"
        >
          <label
            htmlFor="card-search"
            className="mb-3 block text-xs font-bold uppercase tracking-[0.11em] text-white/75"
          >
            Search the archive
          </label>

          <div className="grid grid-cols-[auto_1fr] items-center gap-1 bg-white p-1.5 sm:grid-cols-[auto_1fr_auto]">
            <span
              className="pl-3 text-2xl text-ink/60"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              id="card-search"
              type="search"
              placeholder="Try “Black Lotus” or “t:dragon c:red”"
              className="min-w-0 bg-transparent px-3 py-3 text-ink outline-none placeholder:text-ink/45"
            />

            <button
              type="button"
              className="col-span-2 bg-orange px-6 py-3 font-bold text-white transition hover:brightness-95 sm:col-span-1"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span>Try</span>

            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-2 text-white transition hover:bg-white/10"
            >
              Legendary dragons
            </button>

            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-2 text-white transition hover:bg-white/10"
            >
              Blue instants
            </button>

            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-2 text-white transition hover:bg-white/10"
            >
              Under $5
            </button>
          </div>
        </div>
      </section>

      <section
        id="browse"
        className="border-t border-ink/10 bg-parchment px-6 py-20 lg:px-[7vw]"
      >
        <p className="mb-4 text-[11px] font-extrabold tracking-[0.19em] text-ink/60">
          A PLACE TO BEGIN
        </p>

        <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
          Popular in the archive
        </h2>

        <div className="mt-8 border border-dashed border-ink/25 px-6 py-20 text-center text-ink/55">
          Live cards will appear here after we connect the Scryfall API.
        </div>
      </section>
    </main>
  );
}
