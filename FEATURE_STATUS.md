# Feature Status

Legend: ✅ completed & tested · 🟡 implemented, not yet tested against live Neon · ⏳ waiting for credentials · ❌ not implemented

## Database & ORM

| Feature                                   | Status                                                  |
| ----------------------------------------- | ------------------------------------------------------- |
| Prisma schema (all requested models)      | ✅ `prisma generate` passes                             |
| Neon pooled/direct connection config      | 🟡 configured, needs real `DATABASE_URL`/`DIRECT_URL`   |
| Singleton Prisma client (hot-reload safe) | ✅ `src/lib/db/prisma.ts`                               |
| Migrations                                | 🟡 `prisma migrate dev` ready; not run (no credentials) |
| Seed from existing catalog                | 🟡 `prisma/seed.ts` ready; not run                      |
| Decimal money, INR default                | ✅                                                      |

## Auth & security

| Feature                                 | Status                                          |
| --------------------------------------- | ----------------------------------------------- |
| Register / login / logout               | 🟡 implemented                                  |
| scrypt password hashing                 | ✅                                              |
| httpOnly session cookies, 30-day expiry | ✅                                              |
| Password reset flow                     | 🟡 token generated; email delivery pending SMTP |
| Email verification                      | 🟡 same                                         |
| RBAC CUSTOMER/ADMIN/SUPER_ADMIN         | ✅ enforced server-side                         |
| Rate limiting                           | ❌ (recommended, see SECURITY.md)               |

## Storefront

| Feature                                | Status                                  |
| -------------------------------------- | --------------------------------------- |
| Product/category/collection APIs       | 🟡                                      |
| Shop page DB loader + filters          | 🟡 wired, falls back to static catalog  |
| Product detail DB loader               | 🟡 wired                                |
| Collection page DB loader              | 🟡 wired                                |
| Search DB loader                       | 🟡 wired                                |
| Homepage sections                      | ❌ still static catalog (fallback-safe) |
| Cart API (guest + user)                | 🟡                                      |
| Wishlist API                           | 🟡                                      |
| Orders API (transactional, stock-safe) | 🟡                                      |
| Reviews API                            | 🟡                                      |
| Addresses API                          | 🟡                                      |

## Payments & shipping

| Feature                                  | Status                                  |
| ---------------------------------------- | --------------------------------------- |
| Razorpay order create / verify / webhook | ⏳ needs `RAZORPAY_*` env               |
| Signature verification + idempotency     | ✅ code complete                        |
| Shiprocket shipment creation             | ⏳ needs `SHIPROCKET_*` env             |
| COD orders                               | 🟡 supported via `paymentMethod: "cod"` |

## Admin

| Feature                           | Status                                                               |
| --------------------------------- | -------------------------------------------------------------------- |
| Dashboard aggregates (real DB)    | 🟡 `/api/admin/dashboard`                                            |
| Order status management + history | 🟡                                                                   |
| Customer list                     | 🟡                                                                   |
| Inventory management              | 🟡                                                                   |
| Admin UI wiring                   | ❌ existing `admin.tsx` still uses local store — API endpoints ready |

## Testing

- `prisma generate` ✅, `tsc --noEmit` ✅, `vite build` ✅
- Live DB CRUD / auth / order transaction tests: ⏳ blocked on Neon credentials
