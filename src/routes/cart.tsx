import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE, formatINR, getProduct } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow, LinkButton } from "@/components/site/ui-bits";
import { cartSubtotal, useCartStore } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Bag — AURELLE" },
      { name: "description", content: "Review the pieces in your AURELLE bag." },
    ],
  }),
});

function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto flex max-w-[1600px] flex-col items-center px-6 py-32 text-center lg:px-10">
          <p className="eyebrow text-[#C3A46B]">Your bag</p>
          <h1 className="mt-3 font-display text-4xl text-[#111111] sm:text-5xl">
            Nothing here yet.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-[#88847D]">
            Your bag is empty. Discover pieces designed to become part of your story.
          </p>
          <LinkButton to="/shop" className="mt-10">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-10">
          <Eyebrow>Your bag</Eyebrow>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
            {items.length} {items.length === 1 ? "piece" : "pieces"}
          </h1>
        </div>

        {/* Free shipping progress */}
        <div className="mb-10 border border-[#111111]/10 bg-white/50 p-5">
          <p className="text-xs text-[#111111]/80">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <span className="font-semibold text-[#C3A46B]">
                You've unlocked complimentary insured shipping.
              </span>
            ) : (
              <>
                Add{" "}
                <span className="font-semibold text-[#111111]">
                  {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)}
                </span>{" "}
                more for complimentary shipping
              </>
            )}
          </p>
          <div className="mt-3 h-1 w-full bg-[#111111]/10">
            <div
              className="h-full bg-[#C3A46B] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="divide-y divide-[#111111]/10 border-y border-[#111111]/10">
            {items.map((item) => {
              const product = getProduct(item.handle);
              return (
                <div key={item.key} className="flex gap-5 py-6">
                  <Link
                    to="/product/$handle"
                    params={{ handle: item.handle }}
                    className="h-28 w-24 shrink-0 overflow-hidden bg-[#E8E0D6]/40 sm:h-36 sm:w-28"
                  >
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to="/product/$handle"
                          params={{ handle: item.handle }}
                          className="font-display text-lg text-[#111111] hover:text-[#C3A46B]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-[#88847D]">
                          Size: {item.size}
                          {product?.material ? ` · ${product.material}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#111111]">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-[#111111]/20">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="px-3 py-2 text-[#111111] hover:bg-[#E8E0D6]/50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="px-3 py-2 text-[#111111] hover:bg-[#E8E0D6]/50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="flex items-center gap-1.5 text-xs text-[#88847D] transition-colors hover:text-[#B45309]"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#111111]/10 bg-white/50 p-6">
              <p className="eyebrow mb-5 text-[#111111]">Order summary</p>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#88847D]">Subtotal</dt>
                  <dd className="text-[#111111]">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#88847D]">Shipping</dt>
                  <dd className={cn("text-[#111111]", shipping === 0 && "text-[#C3A46B]")}>
                    {shipping === 0 ? "Complimentary" : formatINR(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[#111111]/10 pt-3">
                  <dt className="font-semibold text-[#111111]">Total</dt>
                  <dd className="font-semibold text-[#111111]">{formatINR(total)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 bg-[#111111] py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] transition-colors hover:bg-[#C3A46B] hover:text-[#111111]"
              >
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="mt-3 block text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D] hover:text-[#111111]"
              >
                Continue shopping
              </Link>
              <p className="mt-5 text-center text-[11px] leading-relaxed text-[#88847D]">
                Secure checkout · UPI, cards & net banking · Insured delivery
              </p>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
