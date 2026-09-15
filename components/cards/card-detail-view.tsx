import Image from "next/image";
import Link from "next/link";

import { CardFaceViewer } from "@/components/cards/card-face-viewer";
import { AddToDeckControl } from "@/components/decks/add-to-deck-control";
import type { CardDetailsBundle } from "@/types/card";
import type { ScryfallLegality } from "@/types/scryfall";

const FEATURED_FORMATS = [
  "standard",
  "pioneer",
  "modern",
  "legacy",
  "vintage",
  "commander",
  "pauper",
  "brawl",
  "historic",
  "timeless",
] as const;

const LEGALITY_STYLES: Record<ScryfallLegality, string> = {
  legal: "border-moss/35 bg-moss/10 text-moss",
  restricted: "border-orange/45 bg-orange/10 text-orange",
  banned: "border-red-400/35 bg-red-400/10 text-red-300",
  not_legal: "border-ink/10 bg-ink/5 text-ink/55",
};

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatPrice(value: string | null, currency = "$") {
  return value ? `${currency}${value}` : "Unavailable";
}

export function CardDetailView({ bundle }: { bundle: CardDetailsBundle }) {
  const { card, printings, rulings } = bundle;
  const otherPrintings = printings?.cards.filter((printing) => printing.id !== card.id) ?? [];
  const visiblePrintings = otherPrintings.slice(0, 24);
  const marketplaceLinks = [
    { label: "TCGplayer", href: card.purchaseUris.tcgplayer },
    { label: "Cardmarket", href: card.purchaseUris.cardmarket },
    { label: "Cardhoarder", href: card.purchaseUris.cardhoarder },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );

  return (
    <main
      id="main-content"
      className="py-8 text-ink sm:py-10"
    >
      <div className="site-container">
        <nav aria-label="Breadcrumb" className="text-sm text-ink/65">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/explore" className="transition hover:text-moss">
                Explore
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink" aria-current="page">
              {card.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(290px,430px)_minmax(0,1fr)] xl:gap-16">
          <aside className="self-start lg:sticky lg:top-28">
            <CardFaceViewer
              cardName={card.name}
              fallbackImageUrl={card.imageUrl}
              faces={card.cardFaces}
            />

            <section className="mt-5 border border-ink/15 bg-parchment/90 p-5">
              <p className="text-xs font-medium text-moss">
                Add this card
              </p>
              <div className="mt-4">
                <AddToDeckControl card={card} />
              </div>
            </section>
          </aside>

          <div className="min-w-0">
            <header className="border-b border-ink/15 pb-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-medium text-ink/65">
                    {card.setName} · {card.setCode.toUpperCase()} #{card.collectorNumber}
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight break-words sm:text-4xl">
                    {card.name}
                  </h1>
                </div>

                {card.manaCost && (
                  <code className="border border-moss/25 bg-moss/10 px-4 py-3 text-base text-moss">
                    {card.manaCost}
                  </code>
                )}
              </div>

              <p className="mt-6 text-xl text-ink/80">{card.typeLine}</p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-md border border-orange/25 px-3 py-2 text-orange">
                  {formatLabel(card.rarity)}
                </span>
                <span className="rounded-md border border-ink/15 px-3 py-2 text-ink/70">
                  Mana value {card.manaValue}
                </span>
                <span className="rounded-md border border-ink/15 px-3 py-2 text-ink/70">
                  {formatDate(card.releasedAt)}
                </span>
                {card.colorIdentity.length > 0 && (
                  <span className="rounded-md border border-moss/25 px-3 py-2 text-moss">
                    Identity {card.colorIdentity.join("")}
                  </span>
                )}
              </div>
            </header>

            <section className="grid gap-8 border-b border-ink/10 py-9 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Oracle text</h2>

                {card.cardFaces.length > 1 ? (
                  <div className="mt-5 space-y-6">
                    {card.cardFaces.map((face, index) => (
                      <article
                        key={`${face.name}:${index}`}
                        className="border-l-2 border-orange/35 pl-5"
                      >
                        <h3 className="text-base font-semibold">{face.name}</h3>
                        <p className="mt-2 whitespace-pre-line text-base leading-7 text-ink/80">
                          {face.oracleText || "This face has no Oracle text."}
                        </p>
                        {face.flavorText && (
                          <p className="mt-4 whitespace-pre-line font-serif text-base italic leading-7 text-moss/90">
                            {face.flavorText}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink/80">
                      {card.oracleText || "This card has no Oracle text."}
                    </p>
                    {card.flavorText && (
                      <p className="mt-5 whitespace-pre-line border-l-2 border-moss/35 pl-5 font-serif text-lg italic leading-8 text-moss/90">
                        {card.flavorText}
                      </p>
                    )}
                  </>
                )}

                {card.printedText && card.printedText !== card.oracleText && (
                  <details className="mt-6 border border-ink/15 bg-paper/50 p-4">
                    <summary className="cursor-pointer font-bold text-orange">
                      Compare printed text
                    </summary>
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/75">
                      {card.printedText}
                    </p>
                  </details>
                )}
              </div>

              <dl className="grid content-start gap-5 border border-ink/10 bg-paper/45 p-5 text-sm">
                <div>
                  <dt className="text-xs font-medium text-ink/65">
                    Artist
                  </dt>
                  <dd className="mt-1 text-ink/85">
                    {card.artist ? (
                      <Link
                        href={{
                          pathname: "/explore",
                          query: { artist: card.artist },
                        }}
                        className="transition hover:text-moss"
                      >
                        {card.artist}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </dd>
                </div>
                {(card.power || card.toughness) && (
                  <div>
                    <dt className="text-xs font-medium text-ink/65">
                      Power / toughness
                    </dt>
                    <dd className="mt-1 text-ink/85">
                      {card.power ?? "–"} / {card.toughness ?? "–"}
                    </dd>
                  </div>
                )}
                {card.loyalty && (
                  <div>
                    <dt className="text-xs font-medium text-ink/65">
                      Loyalty
                    </dt>
                    <dd className="mt-1 text-ink/85">{card.loyalty}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-ink/65">
                    Language
                  </dt>
                  <dd className="mt-1 uppercase text-ink/85">{card.language}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ink/65">
                    Finish
                  </dt>
                  <dd className="mt-1 text-ink/85">
                    {card.finishes.map(formatLabel).join(", ") || "Unknown"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="border-b border-ink/10 py-9" aria-labelledby="legality-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-moss">
                    FORMAT CHECK
                  </p>
                  <h2 id="legality-heading" className="mt-2 text-xl font-semibold tracking-tight">
                    Card legality
                  </h2>
                </div>
                <p className="text-xs text-ink/60">Legality can change over time.</p>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {FEATURED_FORMATS.map((format) => {
                  const status = card.legalities[format] ?? "not_legal";

                  return (
                    <div
                      key={format}
                      className={`flex min-h-12 items-center justify-between gap-3 border px-4 py-3 ${LEGALITY_STYLES[status]}`}
                    >
                      <dt className="font-bold">{formatLabel(format)}</dt>
                      <dd className="text-xs uppercase tracking-[0.08em]">
                        {formatLabel(status)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>

            <section className="border-b border-ink/10 py-9" aria-labelledby="prices-heading">
              <p className="text-xs font-medium text-moss">
                PRINTING VALUE
              </p>
              <h2 id="prices-heading" className="mt-2 text-xl font-semibold tracking-tight">
                Current prices
              </h2>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["USD", formatPrice(card.prices.usd)],
                  ["USD foil", formatPrice(card.prices.usdFoil)],
                  ["USD etched", formatPrice(card.prices.usdEtched)],
                  ["EUR", formatPrice(card.prices.eur, "€")],
                  ["EUR foil", formatPrice(card.prices.eurFoil, "€")],
                  ["MTGO", formatPrice(card.prices.tix, "")],
                ].map(([label, value]) => (
                  <div key={label} className="border border-ink/10 bg-paper/45 p-4">
                    <dt className="text-xs font-medium text-ink/65">
                      {label}
                    </dt>
                    <dd className="mt-1 text-lg text-ink/90">{value}</dd>
                  </div>
                ))}
              </dl>

              {marketplaceLinks.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {marketplaceLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="min-h-11 border border-ink/20 px-4 py-3 text-sm font-bold transition hover:border-moss hover:text-moss"
                    >
                      View on {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-4 max-w-2xl text-xs leading-5 text-ink/60">
                Prices are snapshots from Scryfall and may differ from current marketplace listings.
              </p>
            </section>

            <section className="border-b border-ink/10 py-9" aria-labelledby="printings-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-moss">
                    ACROSS THE ARCHIVE
                  </p>
                  <h2 id="printings-heading" className="mt-2 text-xl font-semibold tracking-tight">
                    {printings ? `${printings.totalCards} paper printing${printings.totalCards === 1 ? "" : "s"}` : "Paper printings"}
                  </h2>
                </div>
                {otherPrintings.length > visiblePrintings.length && (
                  <p className="text-xs text-ink/60">
                    Showing the {visiblePrintings.length} newest
                  </p>
                )}
              </div>

              {printings === null ? (
                <p className="mt-5 text-sm leading-6 text-orange" role="status">
                  Alternate printings are temporarily unavailable. Reload this page to retry, or view the source on Scryfall below.
                </p>
              ) : visiblePrintings.length > 0 ? (
                <ul className="card-rail mt-6 flex snap-x gap-4 overflow-x-auto pb-5" aria-label="Other printings">
                  {visiblePrintings.map((printing) => (
                  <li key={printing.id} className="w-40 shrink-0 snap-start">
                    <Link
                      href={`/cards/${printing.id}`}
                      prefetch={false}
                      className="group block h-full border border-ink/10 bg-paper/45 p-2 transition hover:border-moss/45"
                    >
                      <div className="overflow-hidden rounded-lg bg-night">
                        {printing.imageUrl ? (
                          <Image
                            src={printing.imageUrl}
                            alt={`${printing.name}, ${printing.setName} printing`}
                            width={244}
                            height={340}
                            sizes="160px"
                            unoptimized
                            loading="lazy"
                            className="h-auto w-full transition group-hover:scale-[1.015]"
                          />
                        ) : (
                          <div className="grid aspect-[488/680] place-items-center p-3 text-center text-xs text-ink/65">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-bold leading-5 group-hover:text-moss">
                        {printing.setName}
                      </p>
                      <p className="mt-1 text-xs text-ink/60">
                        {printing.setCode.toUpperCase()} #{printing.collectorNumber}
                      </p>
                      <p className="mt-2 text-xs text-moss">
                        {formatPrice(printing.priceUsd)}
                      </p>
                    </Link>
                  </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm leading-6 text-ink/65">
                  No other paper printings are currently listed for this card.
                </p>
              )}
            </section>

            <section className="py-9" aria-labelledby="rulings-heading">
              <p className="text-xs font-medium text-moss">
                OFFICIAL CLARIFICATIONS
              </p>
              <h2 id="rulings-heading" className="mt-2 text-xl font-semibold tracking-tight">
                Rulings
              </h2>

              {rulings === null ? (
                <p className="mt-5 text-sm leading-6 text-orange" role="status">
                  Rulings are temporarily unavailable. Reload this page to retry, or view the source on Scryfall below.
                </p>
              ) : rulings.length > 0 ? (
                <ol className="mt-6 space-y-4">
                  {rulings.map((ruling) => (
                    <li key={ruling.id} className="grid gap-2 border-l-2 border-moss/30 pl-5 sm:grid-cols-[120px_1fr] sm:gap-5">
                      <time className="text-xs font-bold uppercase tracking-[0.08em] text-moss" dateTime={ruling.publishedAt}>
                        {formatDate(ruling.publishedAt)}
                      </time>
                      <p className="text-sm leading-7 text-ink/80">{ruling.comment}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 text-sm leading-6 text-ink/65">
                  No card-specific rulings are currently listed for this card.
                </p>
              )}

              <a
                href={card.scryfallUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex min-h-11 items-center border border-orange/40 px-4 py-3 text-sm font-bold text-orange transition hover:bg-orange hover:text-night"
              >
                View source data on Scryfall ↗
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
