# What to Eat: Project Plan & Spec

## Context

A new app where family members put together a list of meals and vote each day on what to have for lunch. Every member has their own account and belongs to one family. Members can propose meals and add recipes to them: ingredients, prep steps, and an optional YouTube or Instagram link. The home screen shows the family's proposed meals and today's lunch vote.

Decisions confirmed with the user:

- **Voting:** one poll per family per day, one vote per member. A member can change their vote until the family's cutoff time, and the winner is shown after the cutoff.
- **Data and auth:** Postgres with Drizzle. The API handles auth itself: email and password with httpOnly session cookies.
- **Membership:** each user belongs to **exactly one** family.

The stack matches the user's other projects: TypeScript, pnpm 10, Node 24, Drizzle, Zod 4, Tailwind 4 with shadcn/ui, and Vitest.

Location: `/home/elirium/Development/what-to-eat` (new directory, `git init`).

---

## 1. Repository structure (pnpm workspaces monorepo)

```
what-to-eat/
├── apps/
│   ├── api/                      # Fastify 5 REST API
│   │   ├── src/
│   │   │   ├── app.ts            # buildApp(): registers plugins + modules (used by server & tests)
│   │   │   ├── server.ts         # entry: buildApp() + listen, graceful shutdown
│   │   │   ├── config/env.ts     # Zod-validated env (DATABASE_URL, AUTH_SECRET, WEB_ORIGIN, PORT…)
│   │   │   ├── db/
│   │   │   │   ├── client.ts     # drizzle(postgres(DATABASE_URL))
│   │   │   │   ├── schema/       # one file per table group: auth.ts, family.ts, meal.ts, recipe.ts, poll.ts, index.ts
│   │   │   │   └── seed.ts       # dev seed: demo family, members, meals, recipes
│   │   │   ├── plugins/          # fastify-plugin wrapped: db, auth, cors, helmet, rate-limit, swagger, error-handler
│   │   │   ├── modules/          # feature modules, each: routes.ts, service.ts, schemas.ts, *.test.ts
│   │   │   │   ├── auth/
│   │   │   │   ├── families/
│   │   │   │   ├── meals/
│   │   │   │   ├── recipes/
│   │   │   │   └── polls/
│   │   │   ├── lib/              # errors.ts (AppError, NotFound, Forbidden), time.ts (family TZ helpers), video-url.ts
│   │   │   └── hooks/            # requireAuth, requireFamily, requireRole preHandlers
│   │   ├── drizzle/              # generated SQL migrations (committed)
│   │   ├── drizzle.config.ts
│   │   ├── vitest.config.ts
│   │   └── package.json
│   ├── mobile/                   # Expo (SDK 58) + Expo Router React Native app (future, scaffold only)
│   │   ├── src/app/              # Expo Router file routes (_layout.tsx, index.tsx)
│   │   ├── src/features/         # same feature split as web: auth/, family/, meals/, recipes/, polls/
│   │   ├── src/lib/              # api-client.ts, query-client.ts, config.ts (EXPO_PUBLIC_API_URL)
│   │   ├── metro.config.js       # resolves @wte/shared from TS source
│   │   └── app.json              # scheme "whattoeat", bundle id dev.djuricmarko.whattoeat
│   └── web/                      # React 19 + Vite SPA
│       ├── src/
│       │   ├── main.tsx
│       │   ├── routes/           # TanStack Router file-based routes
│       │   ├── features/         # auth/, family/, meals/, recipes/, polls/ → components + hooks (queries/mutations)
│       │   ├── components/ui/    # shadcn/ui generated components
│       │   ├── components/       # shared layout: AppShell, Header, EmptyState
│       │   ├── lib/              # api-client.ts (fetch wrapper, credentials: 'include'), query-client.ts, utils.ts
│       │   └── styles/globals.css
│       ├── index.html
│       ├── vite.config.ts        # dev proxy /api → http://localhost:3000
│       ├── components.json
│       └── package.json
├── packages/
│   ├── shared/                   # Zod schemas + inferred types shared by api & web (DTOs, enums, constants)
│   └── tsconfig/                 # base.json, node.json, react.json
├── docker-compose.yml            # postgres:17 for local dev (Docker isn't installed yet; Neon dev branch or a local Postgres also works)
├── .env.example
├── pnpm-workspace.yaml
├── package.json                  # root scripts: dev (parallel), build, lint, typecheck, test, db:*
├── eslint.config.js              # flat config, typescript-eslint, react-hooks
├── .prettierrc
├── .editorconfig  .gitignore  .nvmrc (24)
├── .github/workflows/ci.yml      # install → lint → typecheck → test (with postgres service) → build
└── README.md / CLAUDE.md
```

Best practices to follow:

- Strict TypeScript everywhere (`strict`, `noUncheckedIndexedAccess`), ESM only, and `workspace:*` deps on `@wte/shared`.
- **One source of truth for validation:** Zod schemas in `packages/shared`. Fastify uses them through `fastify-type-provider-zod` for request and response validation and the OpenAPI docs. The web app uses the same schemas in forms (react-hook-form + `@hookform/resolvers/zod`).
- Feature modules on the API: thin route handlers, business logic in `service.ts`, data access through Drizzle.
- Use the `buildApp()` factory so tests can run with `app.inject()` without opening a port.
- Config comes only from env and is validated at startup. Never commit secrets; keep `.env.example` up to date.
- Use migrations (`drizzle-kit generate` + `migrate`), never `push`, outside local experiments.

---

## 2. Tech stack

| Area    | Choice                                                                                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API     | Fastify 5, `fastify-type-provider-zod`, `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit`, `@fastify/sensible`, `@fastify/swagger` + `@fastify/swagger-ui`, pino logging |
| Auth    | **Better Auth** (email+password, Drizzle adapter, cookie sessions) mounted on Fastify at `/api/auth/*`, so session security isn't hand-written. Password hashing is built in (scrypt).              |
| DB      | PostgreSQL 17, Drizzle ORM + drizzle-kit, `postgres` driver                                                                                                                                         |
| Web     | Vite, React 19, TanStack Router (file routes, auth guards), TanStack Query, Tailwind CSS 4, shadcn/ui, react-hook-form + Zod, lucide-react, sonner (toasts), date-fns                               |
| Testing | Vitest (API integration tests against a test DB with `app.inject`; web component tests with Testing Library); optionally Playwright for the core e2e flow                                           |
| Tooling | pnpm workspaces, ESLint 9 flat config + Prettier, tsx (API dev), GitHub Actions CI                                                                                                                  |

---

## 3. Domain & data model

Better Auth tables (generated by its CLI into `db/schema/auth.ts`): `user`, `session`, `account`, `verification`.

App tables:

**families**

- `id` uuid pk, `name` text, `invite_code` text unique (8 chars, can be regenerated)
- `timezone` text (IANA, default from the creator's browser), `vote_cutoff` time (default `11:30`)
- `created_by` → user, `created_at`

**family_members**

- `user_id` pk → user (**the pk enforces one family per user**), `family_id` → families
- `role` enum `owner | admin | member`, `joined_at`

**meals**

- `id` uuid, `family_id`, `name` (unique per family among active meals, case-insensitive), `description`, `image_url` nullable
- `proposed_by` → user, `created_at`, `archived_at` nullable (soft delete keeps vote history intact)

**recipes** (a meal can have many recipes, from any member)

- `id`, `meal_id`, `author_id`, `title`, `description`
- `servings` int, `prep_minutes` int, `cook_minutes` int, `difficulty` enum `easy|medium|hard`
- `video_url` nullable, `video_platform` enum `youtube|instagram` (derived server-side from the URL)
- `notes`, `created_at`, `updated_at`

**recipe_ingredients**: `id`, `recipe_id`, `position`, `name`, `quantity` numeric nullable, `unit` text nullable, `note`

**recipe_steps**: `id`, `recipe_id`, `position`, `instruction` text

**polls**

- `id`, `family_id`, `poll_date` date (in the family's TZ); unique on (`family_id`, `poll_date`)
- `closes_at` timestamptz (poll_date + vote_cutoff in the family TZ)
- `winner_meal_id` nullable, `closed_at` nullable

**votes**

- pk (`poll_id`, `user_id`), `meal_id`, `updated_at`

Indexes: FKs, `meals(family_id) where archived_at is null`, `votes(poll_id)`.

### Poll rules

- **Lazy creation:** the first `GET /polls/today` of a family's day creates that day's poll inside a transaction (`ON CONFLICT DO NOTHING`). No cron job is needed.
- **Candidates:** all active (non-archived) meals of the family.
- **Voting:** an upsert on (`poll_id`, `user_id`) is allowed only while `now < closes_at`. A member can also withdraw their vote.
- **Closing:** the first read after `closes_at` tallies the votes, picks the winner, and sets `winner_meal_id` and `closed_at` in a transaction (idempotent).
- **Tie-break:** among tied meals, pick the one that won least recently (or never won), then the earliest-proposed one. If there are no votes, there is no winner and the UI says "No decision today".
- Once a poll is closed, archiving a meal doesn't affect it.

---

## 4. API spec (prefix `/api`, JSON, cookie session)

**Auth** (Better Auth handler): `POST /auth/sign-up/email`, `POST /auth/sign-in/email`, `POST /auth/sign-out`, `GET /auth/get-session`

**Me**

- `GET /me` returns the user plus their family membership (or `null`). The web app uses this to decide which onboarding route to show.

**Families**

- `POST /families` creates a family `{name, timezone}`. The caller becomes `owner`. Returns 409 if the caller already has a family.
- `POST /families/join` joins with `{inviteCode}`. Returns 409 if the caller is already in a family and 404 for an invalid code.
- `GET /families/current` returns the family plus its members.
- `PATCH /families/current` updates `{name, timezone, voteCutoff}` (owner/admin).
- `POST /families/current/invite-code/regenerate` (owner/admin)
- `PATCH /families/current/members/:userId` changes a member's role (owner only).
- `DELETE /families/current/members/:userId` removes a member (owner/admin; the owner can't be removed).
- `POST /families/current/leave` (the owner must transfer ownership first, unless they're the last member, in which case the family is deleted).

**Meals** (all scoped to the caller's family)

- `GET /meals?search=` lists active meals with `proposedBy`, `recipeCount`, `timesWon`, and `lastWonAt`.
- `POST /meals` takes `{name, description?, imageUrl?}`.
- `GET /meals/:id` returns the meal and its recipe summaries.
- `PATCH /meals/:id` (proposer or admin)
- `DELETE /meals/:id` archives the meal (proposer or admin).

**Recipes**

- `GET /meals/:mealId/recipes`
- `POST /meals/:mealId/recipes` takes the full recipe, including the `ingredients[]` and `steps[]` arrays, in one transaction.
- `GET /recipes/:id`
- `PUT /recipes/:id` replaces the whole recipe, including its ingredients and steps (author or admin).
- `DELETE /recipes/:id` (author or admin)
- Video URL validation (`lib/video-url.ts`): only `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, and `instagram.com/(p|reel)/` are accepted. The server normalizes the URL and stores the platform.

**Polls**

- `GET /polls/today` returns the poll (created lazily), the candidates with vote counts and voter names, `myVote`, `closesAt`, `status (open|closed)`, and `winner`.
- `PUT /polls/today/vote` takes `{mealId}`. Returns 409 if the poll is closed and 400 if the meal isn't an active meal of the family.
- `DELETE /polls/today/vote`
- `GET /polls?from&to` returns past polls and winners (history).

**Cross-cutting**

- Errors use one consistent shape: `{ error: { code, message, details? } }`. A global error handler maps Zod errors to 400.
- Authorization: `requireAuth` returns 401. `requireFamily` returns 403 `NO_FAMILY`. Every family-scoped query filters by `family_id` from the session and **never** from the client, and returns 404 for resources in another family.
- Rate limiting: global, plus stricter limits on auth and join (to stop people from guessing invite codes).
- Swagger UI is available at `/docs` in development. `GET /health` checks the DB with `select 1`.
- CORS is restricted to `WEB_ORIGIN` with credentials. Cookies are `httpOnly`, `sameSite=lax`, and `secure` in production. In dev, the Vite proxy keeps everything same-origin.

---

## 5. Web app spec

**Routes (TanStack Router)**

- `/login`, `/register`: public. Logged-in users are redirected away.
- `/onboarding`: requires auth and no family. Two cards: **Create family** (name; timezone is auto-detected) and **Join family** (invite code). `/join/:code` pre-fills the code.
- These routes require auth and a family; otherwise they redirect to `/onboarding`:
  - `/`: **Home**. A "Today's lunch" vote panel sits at the top: a countdown to the cutoff, a meal card for each candidate with a vote button, the vote count and voter avatars, and the user's own vote highlighted. After the cutoff, it shows a winner banner instead. Below it is a grid of proposed meals with search and an "Add meal" button.
  - `/meals/:mealId`: meal details, the list of recipes, and "Add recipe".
  - `/meals/:mealId/recipes/new` and `/recipes/:id/edit`: the recipe form. It has dynamic ingredient rows (qty, unit, name, note) and step rows (reorder and remove), plus a video URL field with live validation.
  - `/recipes/:id`: the recipe view. It shows times, servings, an ingredient checklist, and numbered steps. YouTube links play in an embedded `youtube-nocookie` iframe; Instagram links show as a link card that opens in a new tab.
  - `/history`: past winners.
  - `/family`: settings. Members and their roles, the invite code with copy-link and regenerate buttons, timezone, vote cutoff, and leave family.
- Data: TanStack Query hooks per feature (`useTodayPoll`, `useVote`, …). Voting uses an optimistic update. The today poll is refetched every 15s while open and when the window regains focus, so it stays live without websockets.
- UX: mobile-first (families will mostly use phones), light and dark theme, sonner toasts for errors, and empty and loading skeleton states.

---

## 5b. Mobile app (future)

`apps/mobile` is set up but has no features yet. When it's built out:

- **Screens:** the same as the web routes, using Expo Router (`src/app/(auth)/…`, `src/app/(app)/…` groups with redirects in `_layout.tsx`). The home vote panel and recipe view come first.
- **Auth:** the Better Auth Expo client (`@better-auth/expo`) keeps the session in `expo-secure-store`. On the server, add the `expo()` plugin and put `whattoeat://` in `trustedOrigins`.
- **Video:** YouTube links open in `expo-web-browser` or an embedded WebView. Instagram links open in the browser or the Instagram app through `Linking`.
- **Data:** the same `@wte/shared` schemas and TanStack Query patterns as the web app. The app refetches when it returns to the foreground (already wired to `AppState`).
- **Distribution:** EAS Build and Update (`npx eas-cli@latest init` when we start).

---

## 6. Implementation phases

1. **Scaffold:** monorepo, the tsconfig package, ESLint and Prettier, the `shared` package, the Fastify skeleton (`buildApp`, env, health, error handler, swagger), the Vite React app with Tailwind and shadcn, docker-compose, root scripts, and CI.
2. **DB & auth:** Drizzle setup, the Better Auth schema and handler, `/me`, the auth hooks, and the login and register pages with route guards.
3. **Families:** create, join, invite, and roles API, plus the onboarding and family settings pages.
4. **Meals:** CRUD API and the home meal grid with the add and edit dialogs.
5. **Recipes:** the API with nested ingredients and steps, video URL validation, the recipe form, and the recipe view with the embed.
6. **Polls:** lazy creation, voting, closing and tie-break logic (unit-tested with fake timers and time zones), the home vote panel, and history.
7. **Polish:** seed data, skeletons and empty states, rate limits, README, and an optional Playwright e2e test of the full flow.
8. **Mobile (later):** build out `apps/mobile` as described in 5b.

---

## 7. Verification

- `pnpm install && docker compose up -d && pnpm db:migrate && pnpm db:seed && pnpm dev` starts the API on :3000 and the web app on :5173.
- `pnpm lint && pnpm typecheck && pnpm test` must pass, and CI must be green.
- API integration tests (Vitest + `app.inject` against a test DB) must cover:
  - auth required
  - one-family rule (409)
  - cross-family isolation (404)
  - invite join
  - meal and recipe CRUD permissions
  - video URL validation
  - vote upsert and change
  - vote after cutoff (409)
  - tie-break
  - lazy poll creation that's idempotent under concurrent requests
- Manual end-to-end test in two browsers:
  1. User A registers, creates a family, and copies the invite link.
  2. User B registers and joins through the link.
  3. Both propose meals and add a recipe with a YouTube link.
  4. Both vote, and B changes their vote.
  5. Set the cutoff to 1 minute from now, then check that the winner banner appears and voting is blocked.
- Check that `/docs` (Swagger) lists every endpoint.
