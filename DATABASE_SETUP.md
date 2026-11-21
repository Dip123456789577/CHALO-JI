# Database Setup — Neon + Prisma

## 1. Create a Neon project

1. Sign up at https://neon.tech and create a project (region closest to your users).
2. In the Neon dashboard → **Connection Details**, copy:
   - **Pooled connection** string (contains `-pooler`) → `DATABASE_URL`
   - **Direct connection** string (no `-pooler`) → `DIRECT_URL`

## 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/aurelle?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/aurelle?sslmode=require"
SESSION_SECRET="$(openssl rand -hex 32)"
```

Never commit `.env`. The pooled URL is used by the app (serverless driver adapter); the direct URL is used only by Prisma CLI migrations.

## 3. Generate client, migrate, seed

```sh
npm install
npm run db:generate   # prisma generate
npm run db:migrate    # creates prisma/migrations + applies to Neon
npm run db:seed       # loads catalog demo data
```

Optional demo admin (only when you want one):

```sh
SEED_ADMIN_EMAIL=admin@aurelle.in SEED_ADMIN_PASSWORD='...' npm run db:seed
```

## 4. Production

```sh
npm run db:deploy     # applies pending migrations, no prompts
```

## Architecture notes

- Prisma 7 with the `prisma-client` generator → typed client in `src/generated/prisma`.
- Runtime connects via `@prisma/adapter-neon` (pooled `DATABASE_URL`) — see `src/lib/db/prisma.ts` (singleton, hot-reload safe).
- CLI/migrations use `DIRECT_URL` via `prisma.config.ts`.
- All money columns are `Decimal(12,2)`; currency defaults to `INR`.
- If `DATABASE_URL` is missing or Neon is unreachable, every storefront server function falls back to the static catalog in `src/lib/catalog.ts` — the site keeps working.
