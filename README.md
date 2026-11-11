# What to Eat

A family app for deciding what to have for lunch. Members propose meals, share recipes (ingredients, steps, and YouTube or Instagram videos), and vote once a day before the family's cutoff time.

See [docs/SPEC.md](docs/SPEC.md) for the full product and technical spec.

## Stack

- **API** (`apps/api`): Fastify 5, Zod (`fastify-type-provider-zod`), Drizzle ORM + PostgreSQL, Better Auth
- **Web** (`apps/web`): React 19, Vite, TanStack Router and Query, Tailwind CSS 4, shadcn/ui
- **Mobile** (`apps/mobile`): Expo SDK 58, Expo Router, TanStack Query. Scaffold only; the features come later.
- **Shared** (`packages/shared`): Zod schemas and types used by both apps
- pnpm workspaces, TypeScript (strict), ESLint, Prettier, Vitest

## Getting started

Requires Node 24, pnpm 10, and a PostgreSQL 17 database (`docker compose up -d` or a Neon branch).

```sh
cp .env.example .env      # then set BETTER_AUTH_SECRET (e.g. `openssl rand -base64 32`)
pnpm install
docker compose up -d      # local Postgres on :5432
pnpm db:migrate
pnpm db:seed
pnpm dev                  # API on http://localhost:3000, web on http://localhost:5173
```

### Mobile

```sh
cp apps/mobile/.env.example apps/mobile/.env.local   # set EXPO_PUBLIC_API_URL to your machine's LAN IP
pnpm dev:api                                         # the API must be reachable from the phone
pnpm dev:mobile                                      # scan the QR code with Expo Go, or press a / i for an emulator
```

Use `pnpm --filter @wte/mobile dev:tunnel` if your phone isn't on the same network. Add packages with `pnpm --filter @wte/mobile exec expo install <pkg>` so the versions match the SDK.

API docs (Swagger) are served at http://localhost:3000/docs in development.

## Scripts

| Command                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `pnpm dev`                  | Run the API and web app in watch mode    |
| `pnpm build`                | Build all packages                       |
| `pnpm lint` / `pnpm format` | ESLint / Prettier                        |
| `pnpm typecheck`            | Type-check every package                 |
| `pnpm test`                 | Run Vitest in every package              |
| `pnpm db:generate`          | Generate a migration from schema changes |
| `pnpm db:migrate`           | Apply migrations                         |

## Monorepo source resolution

`@wte/shared` exports its TypeScript source under the custom `@wte/source` condition. Vite, tsx, Vitest, Metro (see `apps/mobile/metro.config.js`) and `tsc --noEmit` use that condition, so in development there's no build step for the shared package. Production builds resolve to the compiled `dist`.
