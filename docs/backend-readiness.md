# Database and login readiness

Spellbook currently stores decks in `localStorage`. That keeps the deployed
demo usable without accounts, cookies, infrastructure, or secrets. The project
now has an explicit boundary for adding secure, cross-device persistence later.

## Prepared pieces

- `lib/persistence/contracts.ts` defines the asynchronous deck and session
  interfaces that a server-backed implementation must satisfy.
- `database/schema.sql` describes account ownership, decks, deck entries,
  constraints, cascading deletion, and lookup indexes for PostgreSQL.
- `lib/backend-config.ts` validates whether database and authentication settings
  are complete without reading secrets into client code.
- `.env.example` documents the future server-only environment variables.

No production secrets belong in Git. Copy `.env.example` to `.env.local` only
when starting the backend milestone, replace every example value, and keep
`.env.local` ignored.

## Recommended implementation sequence

1. Choose a hosted PostgreSQL service and apply the reference schema through a
   migration tool. Keep migrations in source control; never edit production
   tables manually.
2. Choose a maintained authentication library or identity provider. Configure
   HTTP-only, secure, same-site session cookies and server-side route guards.
3. Implement `SessionGateway` and a PostgreSQL `DeckRepository`. Repository
   methods must always scope reads and writes by the authenticated owner ID.
4. Add authenticated route handlers for deck CRUD operations with runtime input
   validation, request limits, and consistent error responses.
5. Replace the provider's storage calls with the repository-backed API while
   retaining local storage as an offline or signed-out mode.
6. Add a one-time, user-confirmed migration that copies local decks into a new
   account. Never erase local data until the server confirms the import.
7. Test authorization between two accounts, expired sessions, duplicate writes,
   database failures, and the local-to-cloud migration before deployment.

The SQL file is a reference model, not an active migration. Authentication
providers sometimes own their account and session tables, so adapt those tables
to the selected provider instead of maintaining duplicate identities.
