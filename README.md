# AURELLE — Screenshot Exact Match

Fine jewellery storefront: TanStack Start + React + Tailwind CSS + Zustand, backed by **Prisma ORM + Neon Serverless PostgreSQL**.

## Quick start

```sh
npm install
cp .env.example .env   # fill DATABASE_URL / DIRECT_URL (Neon)
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Without database credentials the storefront still runs — every data layer falls back to the bundled catalog in `src/lib/catalog.ts`.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (Cloudflare via Nitro)
- `npm run lint` / `npm test` — ESLint / Vitest
- `npm run db:generate|db:migrate|db:deploy|db:seed|db:studio` — Prisma workflow

## Docs

- `DATABASE_SETUP.md` — Neon connection setup
- `PRISMA_SETUP.md` — ORM configuration
- `API_DOCUMENTATION.md` — all REST endpoints
- `DATABASE_SCHEMA.md` — entity map
- `SECURITY.md` — auth, payments, hardening
- `FEATURE_STATUS.md` — what's tested vs pending credentials
