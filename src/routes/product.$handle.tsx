import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  CATEGORIES,
  COLLECTIONS,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
  discountPercent,
  formatINR,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { Eyebrow, GoldButton, Price, RatingStars } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ params }) => {
    const { getStoreProduct } = await import("@/lib/server-fns");
    const result = await getStoreProduct({ data: { handle: params.handle } });
    const product = result.product ?? getProduct(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — AURELLE` },
          { name: "description", content: loaderData.product.description },
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-32 text-center lg:px-10">
        <p className="eyebrow text-[#C3A46B]">404</p>
        <h1 className="mt-3 font-display text-4xl text-[#111111]">This piece has moved on.</h1>
        <p className="mt-3 text-sm text-[#88847D]">
          The product you're looking for isn't in the collection.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex bg-[#111111] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] hover:bg-[#C3A46B] hover:text-[#111111]"
        >
          Continue shopping
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "One Size");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "reviews">("details");

  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);

  const wished = wishlist.includes(product.handle);
  const discount = discountPercent(product);
  const related = relatedProducts(product, 4);
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const collection = COLLECTIONS.find((c) => product.collections.includes(c.slug));
  const inStock = product.stock > 0;

  const handleAdd = () => {
    addItem(
      {
        handle: product.handle,
        name: product.name,
        image: product.images[0]!,
        price: product.price,
        size,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1600px] px-6 pt-8 lg:px-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#88847D]">
          <Link to="/" className="hover:text-[#111111]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-[#111111]">
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                to="/shop"
                search={{ category: product.category }}
                className="hover:text-[#111111]"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#111111]">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E0D6]/40">
              <img
                src={product.images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
                key={imageIndex}
              />
              {discount && (
                <span className="absolute left-4 top-4 bg-[#111111] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#F8F5F0]">
                  −{discount}%
                </span>
              )}
              {product.isNew && (
                <span className="absolute right-4 top-4 bg-[#C3A46B] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
                  New
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "aspect-square overflow-hidden border-2 transition-colors",
                    i === imageIndex
                      ? "border-[#C3A46B]"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {collection && (
              <Link
                to="/collections/$slug"
                params={{ slug: collection.slug }}
                className="editorial-link text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B]"
              >
                {collection.name}
              </Link>
            )}
            <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <RatingStars rating={product.rating} />
              <span className="text-xs text-[#88847D]">
                {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </span>
            </div>

            <div className="mt-6">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} />
              {product.price >= FREE_SHIPPING_THRESHOLD ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#88847D]">
                  <Truck className="h-3.5 w-3.5 text-[#C3A46B]" /> Complimentary insured shipping
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#88847D]">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - product.price)} more for complimentary
                  shipping
                </p>
              )}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#88847D]">{product.description}</p>

            {/* Size */}
            <div className="mt-8">
              <p className="eyebrow mb-3 text-[#111111]">
                Size{" "}
                {product.sizes.length > 1 && (
                  <span className="normal-case tracking-normal text-[#88847D]">— {size}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-[3rem] border px-4 py-2.5 text-xs font-medium transition-colors",
                      size === s
                        ? "border-[#111111] bg-[#111111] text-[#F8F5F0]"
                        : "border-[#111111]/20 text-[#111111] hover:border-[#111111]",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-[#111111]/20">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 text-[#111111] hover:bg-[#E8E0D6]/50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-3 text-[#111111] hover:bg-[#E8E0D6]/50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <GoldButton onClick={handleAdd} disabled={!inStock} className="flex-1 sm:flex-none">
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added to bag
                  </>
                ) : inStock ? (
                  "Add to bag"
                ) : (
                  "Sold out"
                )}
              </GoldButton>
              <button
                onClick={() => toggleWishlist(product.handle)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center border transition-colors",
                  wished
                    ? "border-[#C3A46B] bg-[#C3A46B]/10 text-[#C3A46B]"
                    : "border-[#111111]/20 text-[#111111] hover:border-[#111111]",
                )}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn("h-5 w-5", wished && "fill-[#C3A46B]")} />
              </button>
            </div>

            {!inStock && (
              <p className="mt-3 text-xs text-[#B45309]">
                This piece is currently sold out. Join the waitlist via the newsletter.
              </p>
            )}

            {/* Trust row */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#111111]/10 pt-8">
              {[
                { icon: ShieldCheck, label: "1-Year Warranty" },
                { icon: Truck, label: "Insured Shipping" },
                { icon: RotateCcw, label: "14-Day Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="h-5 w-5 text-[#C3A46B]" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#88847D]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-10 border-t border-[#111111]/10">
              <div className="flex gap-6">
                {(["details", "shipping", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "border-b-2 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                      activeTab === tab
                        ? "border-[#C3A46B] text-[#111111]"
                        : "border-transparent text-[#88847D] hover:text-[#111111]",
                    )}
                  >
                    {tab === "reviews" ? `Reviews (${product.reviewCount})` : tab}
                  </button>
                ))}
              </div>

              <div className="py-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <Eyebrow>Material & Finish</Eyebrow>
                      <p className="mt-2 text-sm text-[#111111]/80">
                        {product.material} · {product.color}
                      </p>
                    </div>
                    <div>
                      <Eyebrow>The Details</Eyebrow>
                      <ul className="mt-2 space-y-1.5">
                        {product.details.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-[#111111]/80">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C3A46B]" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Eyebrow>Care</Eyebrow>
                      <p className="mt-2 text-sm leading-relaxed text-[#111111]/80">
                        Store in the included keepsake pouch. Wipe gently with a soft cloth after
                        wear. Avoid contact with perfume, chlorine and household chemicals. Your
                        piece arrives with a 1-year warranty card.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4 text-sm leading-relaxed text-[#111111]/80">
                    <p>
                      <span className="font-semibold text-[#111111]">Shipping:</span> Every order
                      ships fully insured via our courier partner. Complimentary on orders above{" "}
                      {formatINR(FREE_SHIPPING_THRESHOLD)}; otherwise a flat{" "}
                      {formatINR(SHIPPING_FLAT_RATE)} applies.
                    </p>
                    <p>
                      <span className="font-semibold text-[#111111]">Delivery:</span> Metro cities
                      2–4 business days; rest of India 4–7 business days. You'll receive tracking
                      the moment your piece leaves our atelier.
                    </p>
                    <p>
                      <span className="font-semibold text-[#111111]">Returns:</span> 14-day easy
                      returns on unworn pieces in original packaging. See our{" "}
                      <Link
                        to="/pages/$slug"
                        params={{ slug: "returns" }}
                        className="text-[#C3A46B] underline underline-offset-4"
                      >
                        Returns & Exchanges
                      </Link>{" "}
                      policy for full details.
                    </p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="font-display text-5xl text-[#111111]">
                        {product.rating.toFixed(1)}
                      </span>
                      <div>
                        <RatingStars rating={product.rating} />
                        <p className="mt-1 text-xs text-[#88847D]">
                          Based on {product.reviewCount} verified reviews
                        </p>
                      </div>
                    </div>
                    {product.reviews.map((r) => (
                      <div key={r.id} className="border-t border-[#111111]/10 pt-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <RatingStars rating={r.rating} />
                            <span className="text-sm font-medium text-[#111111]">{r.author}</span>
                            {r.verified && (
                              <span className="flex items-center gap-1 text-[11px] text-[#C3A46B]">
                                <Check className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#88847D]">{r.date}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-[#111111]">{r.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#111111]/70">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      <section className="border-t border-[#111111]/10 bg-[#E8E0D6]/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <SectionHeadingLocal title="You may also love" />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeadingLocal({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>Complete the story</Eyebrow>
      <h2 className="mt-3 font-display text-3xl tracking-tight text-[#111111] sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
