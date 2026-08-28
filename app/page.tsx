type FeaturedCard = {
  id: string;
  name: string;
  setName: string;
  price: string;
  manaCost: string;
  manaValue: number;
  typeLine: string;
  colorIdentity: string[];
  symbol: string;
  artClasses: string;
};

const featuredCards: FeaturedCard[] = [
  {
    id: "lightning-bolt",
    name: "Lightning Bolt",
    setName: "Magic 2011",
    price: "$2.18",
    manaCost: "{R}",
    manaValue: 1,
    typeLine: "Instant",
    colorIdentity: ["R"],
    symbol: "R",
    artClasses: "from-[#341b18] via-[#8c3f2f] to-[#e46b39]",
  },
  {
    id: "birds-of-paradise",
    name: "Birds of Paradise",
    setName: "Ravnica Remastered",
    price: "$7.42",
    manaCost: "{G}",
    manaValue: 1,
    typeLine: "Creature — Bird",
    colorIdentity: ["G"],
    symbol: "G",
    artClasses: "from-[#142f25] via-[#2f694d] to-[#9fc7a6]",
  },
  {
    id: "counterspell",
    name: "Counterspell",
    setName: "Dominaria Remastered",
    price: "$1.12",
    manaCost: "{U}{U}",
    manaValue: 2,
    typeLine: "Instant",
    colorIdentity: ["U"],
    symbol: "U",
    artClasses: "from-[#132d3b] via-[#276c8d] to-[#a8d5e9]",
  },
];
export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
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

        <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {featuredCards.map((card) => (
    <article key={card.id} className="group">
      <div
        className={`relative aspect-[488/680] overflow-hidden rounded-[5%] bg-gradient-to-br p-5 shadow-[0_12px_28px_rgba(23,34,27,0.18)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(23,34,27,0.24)] ${card.artClasses}`}
      >
        <div className="absolute inset-[5%] rounded-[4%] border border-white/25" />

        <div className="relative flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-ink/30 font-display text-xl font-bold text-white">
            {card.symbol}
          </span>

          <span className="font-bold text-white">{card.manaCost}</span>
        </div>

        <div className="absolute inset-x-5 bottom-5 bg-paper p-4 text-ink">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-ink/55">
            ARCHIVE PREVIEW
          </p>

          <h3 className="mt-1 font-display text-2xl leading-tight">
            {card.name}
          </h3>

          <p className="mt-2 text-xs text-ink/60">{card.typeLine}</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <h3 className="font-display text-xl leading-tight">{card.name}</h3>
          <p className="mt-1 text-xs text-ink/55">{card.setName}</p>
        </div>

        <strong className="text-sm">{card.price}</strong>
      </div>
    </article>
  ))}
</div>
      </section>
    </main>
  );
}
