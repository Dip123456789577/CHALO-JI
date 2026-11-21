# AURELLE — Reference Audit: misobysonia.com

Audit date: 2026-11-21
Method: server-side fetch of rendered HTML (homepage + linked collection/product/policy URLs discovered in markup). No interactive browser session was available, so all hover, drawer, checkout and account flows are marked **UNVERIFIED** unless directly observable in the fetched markup.

> AURELLE uses this document for _business structure and shopping-workflow inspiration only_. No source code, branding, logos, copy, photography or visual design was copied.

---

## 1. Site identity observed

- Brand: "Miso by Sonia" — men's silver jewellery (rings, bracelets, chains, pendants, accessories).
- Currency displayed: `Rs.` (INR).
- Platform footer attribution: Shopify (`© ... - Miso by Sonia`, "powered by Shopify" link).
- Trust badges in footer area: "1 year warranty", "210,000+ Customers", "Waterproof-anti tarnish".

## 2. Homepage structure (verified from rendered HTML)

1. Hero / campaign banner (top of page; exact copy not fully extracted — **partially verified**).
2. **Accessories** — product grid row with "View all"-style links to `/products/<handle>`.
3. **Most wanted stuff** — best-sellers rail linking to `/collections/best-sellers`.
4. **Just Cuff & Go!** — themed collection rail → `/collections/ear-cuff`.
5. **everyday bracelets** — category rail → `/collections/bracelet`.
6. **pick a personality** — persona/collection rail → `/collections/s295-pendants`.
7. **What's New** — new-arrivals rail → `/collections/new-arrivals`.
8. **Let customers speak for us** — review cards; each review shows product name + link + short testimonial text.
9. **HELP** footer menu: Shipping, Contact Us, Return & Exchange Policy, Exchange request (third-party return app `return_prime` on `miso-by-sonia.myshopify.com`), Warranty — all pointing to `/pages/policies`.
10. **Menu** footer: About me (`/pages/about-us`), Privacy Policy (`/policies/privacy-policy`), Terms of service (`/policies/terms-of-service`), Blogs.

### Product card fields observed

- Product name (linked to `/products/<handle>`)
- Price in `Rs.`
- Occasional badge text (e.g. "Pierce-Free")

### URL conventions observed

- Products: `/products/<handle>`
- Collections: `/collections/<handle>` (e.g. `best-sellers`, `new-arrivals`, `ear-cuff`, `bracelet`, `s295-pendants`)
- Policies: `/pages/policies`, `/pages/about-us`, `/policies/privacy-policy`, `/policies/terms-of-service`

## 3. Collections / category pages

- Collection pages exist per theme (ear cuffs, bracelets, pendants, best sellers, new arrivals).
- Exact filter/sort UI on collection pages: **UNVERIFIED** (not present in fetched homepage markup; Shopify themes typically provide sort + tag filters, but this was not confirmed).

## 4. Product detail pages

- URL pattern `/products/<handle>` confirmed via links.
- Gallery, variant picker, add-to-cart, reviews: **UNVERIFIED** (pages not fetched in this audit pass).

## 5. Cart, search, account

- Cart drawer/page, search behaviour, login/account, wishlist: **UNVERIFIED** — not observable from static fetch. Typical Shopify theme behaviour assumed only as hypothesis, not fact.

## 6. Checkout & payments

- Checkout is Shopify-hosted (implied by platform attribution). Payment methods: **UNVERIFIED**.

## 7. Policies & support

- Single consolidated `/pages/policies` page used for Shipping, Contact, Returns & Warranty links.
- Separate Shopify-native `/policies/privacy-policy` and `/policies/terms-of-service`.
- Exchange requests routed to a third-party returns app.

## 8. Mobile behaviour

- **UNVERIFIED** — no viewport emulation performed.

## 9. Gaps explicitly not verified

Mega-menu structure, announcement bar copy, sorting/filtering controls, quick-add, size guides, order tracking page, newsletter form behaviour, blog content. These require an interactive browser session; none was available during this audit.

## 10. Takeaways applied to AURELLE

- Homepage = stacked editorial rails: category → best sellers → themed collection → persona collection → new arrivals → reviews.
- Collections are first-class navigable entities (`/collections/<slug>`).
- Reviews are tied to specific products.
- Trust signals (warranty, customer count, material claims) live near the footer.
- INR pricing throughout.
