"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CardSearch } from "@/components/card-search";
import { useDecks } from "@/components/deck-provider";

export function SiteHeader() {
  const { decks, isReady, storageError } = useDecks();
  const pathname = usePathname();
  const inExplore = pathname === "/explore" || pathname.startsWith("/cards/");
  const inDecks = pathname.startsWith("/decks");
  const links = [
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/explore", label: "Explore", active: inExplore },
    { href: "/decks", label: "Decks", active: inDecks },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur-md">
      <nav className="site-container site-navigation" aria-label="Primary navigation">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-ink" aria-label="Spellbook home">
          <svg viewBox="0 0 64 64" className="h-8 w-8 rounded-lg shadow-sm ring-1 ring-moss/20" aria-hidden="true" focusable="false">
            <rect width="64" height="64" rx="12" fill="#213b30" />
            <path d="M16 15h22a9 9 0 0 1 9 9v25H25a9 9 0 0 1-9-9Z" fill="none" stroke="#b4d6bf" strokeWidth="4" strokeLinejoin="round" />
            <path d="M25 15v34M33 26h7M33 34h7" fill="none" stroke="#b4d6bf" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>Spellbook</span>
        </Link>
        <ul className="site-navigation-links">
          {links.map(({ href, label, active }) => (
            <li key={href} className="flex">
              <Link href={href} aria-current={active ? "page" : undefined} className="site-nav-link">
                {label}
                {href === "/decks" && isReady && !storageError && decks.length > 0 && (
                  <span className="site-deck-count">{decks.length}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden min-w-0 justify-self-end lg:block lg:w-full lg:max-w-64">
          {pathname !== "/" ? (
            <CardSearch compact id="header-card-search" />
          ) : (
            <p className="text-right text-xs text-ink/60">Card search & deck builder</p>
          )}
        </div>
      </nav>
    </header>
  );
}
