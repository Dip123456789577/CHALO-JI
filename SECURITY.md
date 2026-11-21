# Security

## Authentication

- Passwords hashed with **scrypt** (per-user salt, `timingSafeEqual` compare) — `src/lib/server/auth.ts`.
- Sessions are random 256-bit tokens stored in the `Session` table; transported in an **httpOnly, SameSite=Lax** cookie (`aurelle_session`), `Secure` in production, 30-day expiry.
- Password reset / email verification use single-use `VerificationToken`s (30 min / 24 h TTL).
- Reset invalidates all existing sessions.

## Authorization

- Roles: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` — stored server-side on `User`, **never trusted from the client**.
- `requireRole()` guards every admin endpoint; product delete is SUPER_ADMIN only.
- Order detail endpoints verify ownership (`userId` or matching email) unless admin.

## Payments

- Razorpay signature verified with HMAC-SHA256 (`order_id|payment_id`) before any status change.
- Webhook signature verified against `RAZORPAY_WEBHOOK_SECRET`; handler is idempotent.
- Order totals are computed **server-side from DB prices** — client amounts are never accepted.
- No card data touches the server.

## Data protection

- Prisma parameterizes all queries (no SQL injection).
- Zod validates every request body; pincode format enforced.
- Stock decrements use atomic `updateMany … stock >= qty` inside a transaction — overselling is impossible.
- `.env` is gitignored; `.env.example` contains placeholders only.
- Error responses are generic; internals logged server-side only.
- Admin mutations write `AdminActivityLog` entries.

## Still recommended before production

- Rate limiting on `/api/auth/*` and `/api/orders` (e.g. Cloudflare rules or a middleware).
- SMTP provider for verification/reset emails (tokens currently logged server-side).
- CORS is same-origin by default (TanStack Start); add explicit origins only if the API is consumed cross-origin.
- Rotate `SESSION_SECRET` and Razorpay/Shiprocket keys via env; never commit them.
