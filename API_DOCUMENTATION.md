# API Documentation

All endpoints are same-origin JSON APIs served by TanStack Start server routes (`src/routes/api/**`). Auth uses an httpOnly `aurelle_session` cookie set by `/api/auth/login` and `/api/auth/register`.

## Auth

| Method | Path                              | Auth    | Description                                                                                   |
| ------ | --------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`              | —       | `{email,password,name}` → creates user, sets session cookie                                   |
| POST   | `/api/auth/login`                 | —       | `{email,password}` → sets session cookie                                                      |
| POST   | `/api/auth/logout`                | —       | Clears session                                                                                |
| GET    | `/api/auth/me`                    | session | Current user or 401                                                                           |
| POST   | `/api/auth/forgot-password`       | —       | `{email}` → always `{ok:true}` (no enumeration); token logged server-side until SMTP is wired |
| POST   | `/api/auth/reset-password?email=` | —       | `{token,password}` → resets password, kills sessions                                          |
| POST   | `/api/auth/verify-email?email=`   | —       | `{token}` → marks email verified                                                              |

## Catalog

| Method       | Path                               | Auth                    | Description                                                                                                   |
| ------------ | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| GET          | `/api/products`                    | —                       | Filters: `category,collection,q,minPrice,maxPrice,material,inStock,featured,bestseller,isNew,sort,page,limit` |
| POST         | `/api/products`                    | ADMIN                   | Create product (images, sizes, category/collection slugs)                                                     |
| GET          | `/api/products/:handle`            | —                       | Product by slug or UUID                                                                                       |
| PATCH        | `/api/products/:handle`            | ADMIN                   | Partial update                                                                                                |
| DELETE       | `/api/products/:handle`            | SUPER_ADMIN             | Delete                                                                                                        |
| GET          | `/api/products/:productId/reviews` | —                       | Reviews + aggregate rating                                                                                    |
| POST         | `/api/products/:productId/reviews` | CUSTOMER                | `{rating,title?,body}` — verified if buyer                                                                    |
| GET/POST     | `/api/categories`                  | GET public / POST ADMIN | List / create                                                                                                 |
| PATCH/DELETE | `/api/categories/:id`              | ADMIN / SUPER_ADMIN     | Update / delete (blocked if products exist)                                                                   |
| GET          | `/api/collections`                 | —                       | List                                                                                                          |
| GET          | `/api/collections/:slug`           | —                       | Collection + paginated products                                                                               |

## Cart (guest cookie `aurelle_cart` or user session)

| Method | Path                  | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/cart`           | Cart with items, subtotal, itemCount |
| POST   | `/api/cart/items`     | `{productSlug, variantId?            | size?, quantity}` — server-side stock check |
| PATCH  | `/api/cart/items/:id` | `{quantity}` (0 deletes)             |
| DELETE | `/api/cart/items/:id` | Remove item                          |

## Wishlist (auth required)

| Method | Path                | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/wishlist`     | Items with product info     |
| POST   | `/api/wishlist`     | `{productSlug, variantId?}` |
| DELETE | `/api/wishlist/:id` | Remove item                 |

## Orders

| Method | Path              | Auth           | Description                                                                                                                                                  |
| ------ | ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/orders`     | CUSTOMER       | Own orders                                                                                                                                                   |
| POST   | `/api/orders`     | —              | `{email?, address, addressId?, couponCode?, paymentMethod}` — transactional: validates stock, computes totals server-side, decrements inventory, clears cart |
| GET    | `/api/orders/:id` | owner or ADMIN | Full order incl. payments, shipments, status history                                                                                                         |

## Profile & addresses

| Method       | Path                 | Auth     | Description                              |
| ------------ | -------------------- | -------- | ---------------------------------------- |
| GET/PATCH    | `/api/profile`       | CUSTOMER | Profile (`{name}`)                       |
| GET/POST     | `/api/addresses`     | CUSTOMER | List / create (Indian pincode validated) |
| PATCH/DELETE | `/api/addresses/:id` | CUSTOMER | Update / delete own address              |

## Payments (Razorpay)

| Method | Path                             | Auth      | Description                                                                                        |
| ------ | -------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| POST   | `/api/payments/razorpay/order`   | CUSTOMER  | Creates Razorpay order for a pending order → returns `keyId`, `razorpayOrderId`, `amount`          |
| POST   | `/api/payments/razorpay/verify`  | CUSTOMER  | `{razorpayOrderId,razorpayPaymentId,razorpaySignature}` — HMAC-SHA256 verified before marking PAID |
| POST   | `/api/payments/razorpay/webhook` | signature | Razorpay webhook; verifies `x-razorpay-signature`; idempotent                                      |

## Shipping (Shiprocket)

| Method | Path             | Auth  | Description                                                              |
| ------ | ---------------- | ----- | ------------------------------------------------------------------------ |
| POST   | `/api/shipments` | ADMIN | `{orderId}` → creates Shiprocket shipment, stores AWB as tracking number |

## Admin

| Method    | Path                   | Auth  | Description                                                                          |
| --------- | ---------------------- | ----- | ------------------------------------------------------------------------------------ |
| GET       | `/api/admin/dashboard` | ADMIN | Real aggregates: orders, paid revenue, customers, products, low stock, recent orders |
| GET       | `/api/admin/orders`    | ADMIN | All orders (`?status=` filter)                                                       |
| PATCH     | `/api/admin/orders`    | ADMIN | `{orderId,status,note}` → status + history + activity log                            |
| GET       | `/api/admin/customers` | ADMIN | Customers with order counts and spend                                                |
| GET/PATCH | `/api/admin/inventory` | ADMIN | Stock levels; PATCH `{productId,stock?,variantId?,variantStock?}`                    |

## Errors

`{ "error": "message", "details"?: … }` with appropriate 4xx/5xx. Internal errors are never leaked.
