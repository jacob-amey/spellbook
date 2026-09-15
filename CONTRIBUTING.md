# Working on Spellbook

Use Node.js 24 and install the lockfile with `npm ci`. No API key or database is
required. See the README for setup and the reviewer walkthrough.

1. Create a branch describing the change.
2. Keep deck rules and transformations in `lib/` and display/interaction behavior
   in components. Parse URL state through `lib/card-filters.ts`.
3. Add regression tests for behavioral bugs. Use browser tests for interactions
   across routes, forms, and persistence.
4. Install Chromium with `npx playwright install chromium`, then run `npm run verify`.
5. Review `git diff --check` and changed files before committing. Include screenshots
   for visible changes and explain how behavior was verified.

Do not use personal decks or secrets as fixtures. Do not erase or silently replace
malformed storage. Do not suppress failing rules or lower coverage to make CI pass.

Commit `package-lock.json` with dependency changes. Keep build output, coverage,
browser traces, environment values, and dependencies out of Git. Dependabot opens
updates; review and check them before merging. Updates are not auto-merged.

Use the bug template with steps, expected behavior, browser, and search URL.
Redact personal information. For security issues, use GitHub private vulnerability
reporting if enabled; do not put secrets in public issues. Enabling private
reporting is a repository-owner setting.
