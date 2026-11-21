import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { LinkButton } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Wishlist — AURELLE" },
      { name: "description", content: "Your saved AURELLE pieces." },
    ],
  }),
});

function WishlistPage() {
  const wishlist = useCartStore((s) => s.wishlist);
  const products = wishlist
    .map((h) => getProduct(h))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 flex items-center gap-3">
          <Heart className="h-6 w-6 text-[#C3A46B]" />
          <div>
            <p className="eyebrow text-[#C3A46B]">Saved pieces</p>
            <h1 className="mt-1 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
              Wishlist
            </h1>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-[#111111]/20 py-24 text-center">
            <p className="font-display text-2xl text-[#111111]">Nothing saved yet.</p>
            <p className="mt-2 text-sm text-[#88847D]">
              Tap the heart on any piece to keep it here for later.
            </p>
            <LinkButton to="/shop" className="mt-8">
              Discover pieces
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
