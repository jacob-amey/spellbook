# Publish the repository and demo

Use GitHub for the source and Vercel for the running Next.js app. This preserves
server-rendered card pages, cached lookups, and the autocomplete API. GitHub Pages
serves static files and cannot run those server features.

## Verify and publish the source

```bash
npm ci
npx playwright install chromium
npm run verify
git diff --check
git status
```

Review and commit the intended files. Create an empty GitHub repository, then
follow its **push an existing repository** instructions using its actual URL.
Do not initialize a second repository or overwrite existing history. Keep
environment values, dependencies, build output, and browser reports out of Git.

Open **Actions** after pushing and verify CI is green. No provider secrets are
required. Add a branch rule requiring the verification job before merging PRs.

## Import into Vercel

1. Create a new Vercel project and import the GitHub repository.
2. Select the **Next.js** preset and the repository root directory.
3. Use **Node.js 24.x**, install command `npm ci`, and build command
   `npm run build`. Keep the framework's default output settings.
4. Add no database/auth variables for this release. For SEO, the stable Vercel
   production domain is detected automatically. To use a custom domain or another
   host, set `SITE_URL` to the real HTTPS origin (no path) before building.
   Local/unconfigured builds and Vercel previews are deliberately not indexable.
   After deployment, check `/robots.txt`, `/sitemap.xml`, and canonical metadata.
5. Deploy and open the production URL in a signed-out browser. Ensure the public
   demo is not protected by a Vercel login requirement.

Vercel supports Next.js rendering and Git preview deployments. Check current plan
limits; no particular price or free-tier entitlement is assumed here.

## Make the demo easy to find

- Put the production URL in the repository's **About → Website** field.
- Add a **Live demo** link near the top of the README after verifying the URL.
- Suggested description: “MTG card research and deck builder with Next.js,
  TypeScript, resilient local persistence, and automated browser tests.”
- Suggested topics: `nextjs`, `typescript`, `react`, `tailwindcss`, `vitest`,
  `playwright`, `scryfall`, `deck-builder`.
- Pin the repository to your profile and link both demo and source on your resume.
- Select a license for original code if you want to permit reuse. Third-party
  card data and artwork retain their ownership.

Run the [manual release check](testing.md). Local tests cannot verify production
network access or hosting account settings. Decks belong to a browser and origin:
use JSON export/import to transfer decks from localhost or a preview URL.

If a deployment regresses, roll back to the previous working deployment and fix
the problem in a new commit. Do not rewrite shared Git history to undo deployment.

## Alternative hosts and the next backend milestone

A Node.js host can run `npm ci`, `npm run build`, and `npm start`. It needs Node.js
24, HTTPS, outbound Scryfall access, and a persistent URL. Static hosting alone is
insufficient. AWS/Azure are later options; prioritize a managed PostgreSQL database,
authentication, owner-scoped operations, and authorization tests when adding them.

## References

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel Git integration](https://vercel.com/docs/git)
- [What GitHub Pages hosts](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
