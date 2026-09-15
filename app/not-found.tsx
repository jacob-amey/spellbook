import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto min-h-[65vh] max-w-3xl px-6 py-24">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Error 404</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-ink/70">
        The address may be incorrect or the page may have moved. You can start
        a new card search or return to your saved decks.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/explore" className="bg-orange px-5 py-3 text-sm font-bold text-night">Explore cards</Link>
        <Link href="/decks" className="border border-ink/25 px-5 py-3 text-sm font-bold">Your decks</Link>
      </div>
    </main>
  );
}
