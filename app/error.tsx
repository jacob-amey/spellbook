"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main id="main-content" className="mx-auto min-h-[65vh] max-w-3xl px-6 py-24">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">A temporary interruption</p>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">We couldn’t open this page.</h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-ink/70">
        Try loading it again. If the problem continues, return home and try
        another search. You don’t need to clear your browser’s saved data.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={retry} className="bg-orange px-5 py-3 text-sm font-bold text-night">Try again</button>
        <Link href="/" className="border border-ink/25 px-5 py-3 text-sm font-bold">Return home</Link>
      </div>
    </main>
  );
}
