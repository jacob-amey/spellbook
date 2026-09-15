# Test strategy

With Node.js 24, run from the repository root:

```bash
npm ci
npx playwright install chromium
npm run verify
```

On Linux CI, use `npx playwright install --with-deps chromium`. Browser tests start
and stop a production server on port 3217. Keep that port free; the runner refuses
to test an unknown existing server.

## What is checked

| Layer | Coverage |
| --- | --- |
| Static | ESLint and strict TypeScript, including freshly generated route types |
| Unit | URL parsing, queries, deck quantities/zones/rules, serialization, storage failures, API normalization/errors/cancellation, partial detail failures, backend config, and sample compatibility |
| Browser | Keyboard autocomplete, choice and text filters, clearing filters, retries, create/add/edit/reload/export/import, the sample deck, 404 recovery, navigation at 320px, and favicon/touch-icon responses |
| Accessibility | Automated WCAG 2 A/AA and 2.1 A/AA checks for home, Explore, dashboard, sample editor, and 404 at desktop and mobile Chromium sizes |
| Build | Actual production output, not only a development server |

Coverage thresholds are 90% statements/lines/functions and 80% branches. They apply
to the modules listed in `vitest.config.mts`, not the entire UI. Do not present
these percentages as whole-application coverage.

Browser fixtures replace search and autocomplete responses so CI does not rely on
Scryfall uptime or quota. Routing, forms, React, storage, and downloads run
unchanged. Each test has an isolated browser profile, separate from personal decks.
Server requests are mocked in unit tests. The opt-in live research check exercises
real server requests, double-faced artwork, metadata, and accessibility:

```bash
npm run build
LIVE_SCRYFALL=1 npx playwright test e2e/live-research.spec.ts --workers=1
```

This test is skipped in ordinary CI to avoid making builds depend on Scryfall
uptime. It saves desktop and mobile screenshots under `test-results/`.

## Reports

- `coverage/index.html`: coverage report.
- `playwright-report/index.html`: browser results; open with `npx playwright show-report`.
- `test-results/`: screenshots and traces on failure.
- GitHub Actions retains these reports for seven days, including failed runs.

Inspect a failing trace and reproduce the interaction before changing a test.
Do not increase timeouts or suppress accessibility rules just to obtain a pass.

## Manual release check

1. Open the public URL in a signed-out browser. Confirm no deployment login is required.
2. Search a real card, apply filters, and directly refresh its detail URL. Confirm
   artwork, rulings, and printings load or show an appropriate partial failure.
3. Open the sample deck, edit quantities, move a card to the sideboard, reload,
   export JSON, and import it as a separate deck.
4. Check keyboard navigation, autocomplete, visible focus, 200% zoom, and reduced motion.
5. Check a narrow phone width. Rails and compact tables may scroll internally;
   the whole page should not overflow.
6. Check VoiceOver reading order and announcements in macOS/Safari.

Chromium emulation and axe do not replace screen-reader or physical-device testing,
and a passing scan is not proof of complete WCAG conformance. Current browser CI
does not cover WebKit or Firefox.
