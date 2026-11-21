# Database Schema

PostgreSQL (Neon) via Prisma. Full source: `prisma/schema.prisma`.

## Entity map

```
User ─┬─ Account (OAuth-ready)
      ├─ Session (httpOnly cookie auth)
      ├─ VerificationToken (email verify / password reset)
      ├─ Address ──┐
      ├─ Order ────┤ (addressId snapshot + ship* fields)
      ├─ Review ───┤
      ├─ Cart ─────┤
      ├─ Wishlist ─┤
      └─ AdminActivityLog

Category ── Product ──┬─ ProductImage
Collection ───────────┼─ ProductVariant ── Inventory
                      ├─ CartItem
                      ├─ WishlistItem
                      ├─ OrderItem ── Order
                      └─ Review

Order ──┬─ OrderItem
       ├─ Payment (RAZORPAY|COD|DEMO)
       ├─ Shipment (shiprocket)
       └─ OrderStatusHistory

Coupon, NewsletterSubscriber, SiteSetting, StorePolicy — standalone
```

## Conventions

- **IDs**: UUID v4 (`@db.Uuid`) everywhere.
- **Money**: `Decimal(12,2)` — never Float. Currency column defaults `INR`.
- **Timestamps**: `createdAt`/`updatedAt` on all mutable entities.
- **Deletes**: `Cascade` for owned children (images, variants, cart/wishlist items, sessions, addresses); `SetNull` for historical references (order → user/address/product).
- **Indexes**: on all foreign keys, plus `published+featured`, `published+bestseller`, `published+isNew`, `price`, `status`, `createdAt` for storefront queries.
- **Enums**: `Role` (CUSTOMER/ADMIN/SUPER_ADMIN), `OrderStatus`, `PaymentStatus`, `PaymentProvider`, `ShipmentStatus`, `CouponType`.
- **Snapshots**: `OrderItem.name/sku/size/unitPrice` and `Order.ship*` fields are immutable copies so orders survive catalog changes.
- **Idempotency**: `Payment.providerOrderId`/`providerPaymentId` indexed; `markPaymentPaid` no-ops on repeat.
