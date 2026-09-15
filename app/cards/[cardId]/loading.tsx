export default function CardLoading() {
  return (
    <main id="main-content" className="site-container py-8 sm:py-10">
      <h1 className="text-xl font-semibold">Card details</h1>
      <p role="status" className="mt-2 text-sm text-ink/65">Loading artwork, printings, and rulings…</p>
      <div aria-hidden="true" className="mt-8 grid gap-10 motion-safe:animate-pulse lg:grid-cols-[minmax(290px,430px)_minmax(0,1fr)]">
        <div className="aspect-[488/680] max-w-[430px] rounded-xl bg-parchment" />
        <div className="space-y-6">
          <div className="h-10 w-2/3 rounded-md bg-parchment" />
          <div className="h-5 w-1/2 rounded-md bg-parchment" />
          <div className="h-40 rounded-xl bg-parchment" />
          <div className="h-56 rounded-xl bg-parchment" />
        </div>
      </div>
    </main>
  );
}
