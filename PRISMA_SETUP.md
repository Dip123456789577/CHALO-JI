# Prisma Setup

## Versions

- `prisma` 7.10.1 (CLI, devDependency)
- `@prisma/client` 7.10.1
- `@prisma/adapter-neon` + `@neondatabase/serverless` (driver adapter)

## Layout

```
prisma/
  schema.prisma      # all models — see DATABASE_SCHEMA.md
  migrations/        # generated SQL migrations
  seed.ts            # seeds catalog from src/lib/catalog.ts
prisma.config.ts     # CLI config (schema path, DIRECT_URL, seed command)
src/generated/prisma # generated typed client (do not edit)
src/lib/db/prisma.ts # singleton PrismaClient (Neon adapter)
```

## Commands

| Command               | Purpose                                |
| --------------------- | -------------------------------------- |
| `npm run db:generate` | Regenerate client after schema changes |
| `npm run db:migrate`  | Create + apply a dev migration         |
| `npm run db:deploy`   | Apply migrations in production         |
| `npm run db:seed`     | Seed demo catalog + optional admin     |
| `npm run db:studio`   | Open Prisma Studio                     |

## Rules

- Always run `db:generate` after editing `schema.prisma`.
- Never edit files in `src/generated/`.
- Monetary fields are `Decimal` — convert with `Number()` at API boundaries.
- Server-only code lives in `src/lib/server/` and `src/routes/api/` — never import `@/lib/db/prisma` from client components.
