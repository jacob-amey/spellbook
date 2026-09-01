export default function CardLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-paper/70 px-6 py-12 text-ink lg:px-[6vw]"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading card details…</p>
      <div className="mx-auto grid max-w-[1440px] animate-pulse gap-10 pt-12 lg:grid-cols-[minmax(290px,430px)_minmax(0,1fr)] xl:gap-16">
        <div className="aspect-[488/680] rounded-[4.8%] bg-ink/10" />
        <div>
          <div className="h-4 w-52 bg-orange/15" />
          <div className="mt-5 h-16 max-w-2xl bg-ink/10" />
          <div className="mt-5 h-7 w-72 bg-ink/10" />
          <div className="mt-12 h-56 bg-ink/10" />
          <div className="mt-8 h-44 bg-ink/10" />
        </div>
      </div>
    </main>
  );
}
