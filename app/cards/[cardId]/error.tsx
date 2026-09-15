"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center px-6 py-20 text-ink">
      <div className="max-w-xl border border-orange/30 bg-parchment/90 p-8 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange">
          ARCHIVE CONNECTION
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Card details are temporarily unavailable.</h1>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          Spellbook could not reach the card archive. Your saved decks are unaffected.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="min-h-11 bg-orange px-5 py-3 font-bold text-night"
          >
            Try again
          </button>
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center border border-ink/20 px-5 py-3 font-bold hover:border-orange hover:text-orange"
          >
            Return to Explore
          </Link>
        </div>
      </div>
    </main>
  );
}
