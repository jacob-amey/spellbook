# Repository publishing setup

This is a maintainer checklist. The repository owner and public demo URL must be
filled in after publishing; neither is currently configured in this checkout.
Do not copy placeholder links into the public README unchanged.

## Repository identity

| Field | Recommended value |
| --- | --- |
| Repository name | `spellbook-mtg` |
| Product name | Spellbook |
| Display title | Spellbook — MTG Card Search & Deck Builder |
| Visibility | Public, after reviewing files and history for private information |
| Default branch | `main` |
| Website | The verified production demo URL, not localhost or a protected preview |

Description:

> Magic: The Gathering card search and deck builder built with Next.js and TypeScript, featuring Scryfall integration, resilient local storage, and automated browser tests.

Topics (add individually):

```text
nextjs react typescript tailwindcss scryfall magic-the-gathering
deck-builder vitest playwright accessibility github-actions
```

These describe the implemented app. Do not add AWS, Azure, PostgreSQL, OAuth,
or authentication topics until those integrations are actually implemented.
The npm package can remain named `spellbook` and marked `private: true`; that
prevents accidental npm publication and does not make the GitHub repository private.

## Visual assets

- Social preview: [1280 × 640 PNG](assets/github-social-preview.png).
- README hero: [homepage](screenshots/home.png).
- Product detail: [Explore](screenshots/explore.png), [deck editor](screenshots/deck.png).
- Responsive examples: [mobile homepage](screenshots/mobile-home.png), [mobile Explore](screenshots/mobile-explore.png).
- Brand mark: [`app/icon.svg`](../app/icon.svg).

Upload the social image through repository **Settings → Social preview → Edit**.
GitHub recommends 1280 × 640 and requires an image under 1 MB. The generated asset
uses a screenshot of the application and makes no claims about traffic or adoption.

To regenerate it after updating the homepage screenshot:

```bash
node scripts/generate-social-preview.mjs
```

## Publish in this order

1. Review the intended files and history. Keep credentials, environment values,
   dependencies, build outputs, and personal deck backups out of Git.
2. Run `npm run verify` and `git diff --check`, then commit the release manually.
3. Create an empty GitHub repository; do not initialize a second README or Git
   history. Follow GitHub's instructions to push the existing repository.
4. Verify the **Continuous integration** workflow passes on GitHub itself.
5. Deploy using the [deployment guide](deployment.md). Test the production URL
   while signed out, including direct URL refreshes and sample-deck persistence.
6. Set the repository description, website, topics, and social preview.
7. Add a working demo link and CI badge near the top of the README.
8. Pin the repository to the GitHub profile. Add it to a portfolio or resume with
   separate demo and source links.

## README links and badge

The existing README already contains the overview, screenshots, quick start,
demonstration steps, architecture, testing, and limitations. Keep those sections.
Insert the following near the top only after replacing every placeholder:

```markdown
[Live demo](https://YOUR-PRODUCTION-DOMAIN) ·
[Architecture](docs/architecture.md) · [Testing](docs/testing.md)

[![CI](https://github.com/YOUR-GITHUB-USERNAME/spellbook-mtg/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR-GITHUB-USERNAME/spellbook-mtg/actions/workflows/ci.yml)
```

Use the real workflow badge, not a static "tests passing" badge. One CI badge is
sufficient; avoid a wall of tool, star, visitor, or unverified coverage badges.

## Repository maintenance settings

- Keep Issues enabled for reproducible bug reports; the template already exists.
- Keep Actions enabled and use the existing least-privilege workflow.
- Enable available Dependabot alerts and secret/push protection settings.
- After the first successful run, add a rule for `main` requiring the actual
  verification check. Do not require someone else's approval for every change
  in a solo project unless that is a workflow you can maintain.
- Use short-lived branches and PRs for future changes. Include intent, tests,
  and before/after screenshots for UI work; the PR template is already present.
- Disable unused Wiki, Projects, and Discussions surfaces if they would be empty.
- Keep commit history authentic. Do not manufacture activity or collaborators.
- Choose a license deliberately if permitting reuse of original code. No code
  license has been added; card artwork and data retain their separate ownership.

## First public release

After the public smoke test passes, an appropriate tag is `v0.1.0` (matching the
current package version), with title **Spellbook v0.1.0 — Public demo**.
Do not create or mark this release as published before that check.

Suggested release notes:

> Initial public demo of Spellbook, a Magic: The Gathering card research and
> deck-building application.
>
> - Searchable card catalogue with shareable filters and multiple result views.
> - Card details with printings, rulings, legalities, and marketplace links.
> - Browser-local decks with an editable sample, statistics, and JSON backup/import.
> - Responsive navigation, custom icons, and automated desktop/mobile checks.
>
> Decks are stored in the current browser and do not sync between devices.
> Account login, database persistence, and text-list import are not included.

Add the verified demo link to those notes after deployment.

## Evidence and demo script

Run `npm run verify` before recording or publishing a demo. Use the latest test
report rather than copying a historical test count. Read the current
[test scope](testing.md) before reporting coverage or accessibility claims.

For a 60–90 second walkthrough:

1. Show the homepage and run a card search.
2. Apply a color/type filter and point out the shareable URL.
3. Open a card's rules and printings.
4. Open **Decks → Try a sample deck**, edit a quantity, and show the mana curve.
5. Reload, export JSON, and explain browser-local persistence.
6. Finish on a passing GitHub Actions run and the architecture document.

Use only claims you can explain and demonstrate. There are no measured user
counts, production performance improvements, deployed database/auth features,
or full WCAG-conformance certification to claim. Be candid about tools and
assistance used when asked about the development process.

## Official references

- [Repository social preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
- [Repository topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [Workflow badge](https://docs.github.com/en/actions/how-tos/monitor-workflows/add-a-status-badge)
- [Profile pins](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/pinning-items-to-your-profile)
