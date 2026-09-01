import Link from "next/link";

export default function CardNotFound() {
  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center px-6 py-20 text-ink">
      <div className="max-w-xl border border-ink/15 bg-parchment/90 p-8 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange">
          MISSING FROM THE ARCHIVE
        </p>
        <h1 className="mt-3 font-display text-4xl">That card could not be found.</h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          The link may be outdated, or the printing may no longer be available from the card data provider.
        </p>
        <Link
          href="/explore"
          className="mt-7 inline-flex min-h-11 items-center bg-orange px-5 py-3 font-bold text-night"
        >
          Search the archive
        </Link>
      </div>
    </main>
  );
}
