# What to Eat

The product and technical spec is in `docs/SPEC.md`. Follow its phases and its data model.

- pnpm workspaces: `apps/api` (Fastify), `apps/web` (React + Vite), `apps/mobile` (Expo + Expo Router; see `apps/mobile/AGENTS.md`), `packages/shared` (Zod schemas), `packages/tsconfig`.
- Every request and response shape goes in `packages/shared` as a Zod schema. The API uses it through `fastify-type-provider-zod`, and web forms use it through `@hookform/resolvers/zod`.
- Organize the API by feature: `src/modules/<feature>/{routes,service}.ts`. Throw `AppError` helpers from `src/lib/errors.ts`; errors use the `{ error: { code, message, details? } }` shape.
- Family-scoped queries always take `familyId` from the session, never from the request.
- Tests: Vitest with `buildApp(testEnv)` and `app.inject()`.
- Before finishing, run `pnpm lint && pnpm typecheck && pnpm test`.
- In the mobile app, add packages with `pnpm --filter @wte/mobile exec expo install <pkg>`, never a plain `pnpm add`, so versions match the SDK.
