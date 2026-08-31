export default function LoadingDeck() {
  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-76px)] bg-parchment px-6 py-16 text-ink lg:px-[5vw]"
    >
      <div
        className="mx-auto max-w-7xl animate-pulse"
        aria-busy="true"
        aria-label="Loading deck workspace"
      >
        <div className="h-4 w-32 bg-ink/10" />
        <div className="mt-8 h-36 bg-paper" />
        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="h-96 bg-paper" />
          <div className="h-80 bg-paper" />
        </div>
      </div>
    </main>
  );
}
