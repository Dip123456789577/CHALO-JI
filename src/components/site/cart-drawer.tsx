import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD, formatINR } from "@/lib/catalog";
import { cartCount, cartSubtotal, useCartStore } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const open = useCartStore((s) => s.cartOpen);
  const setOpen = useCartStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = cartSubtotal(items);
  const count = cartCount(items);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#111111]/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-[#F8F5F0] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-[#111111]/10 px-6 py-5">
          <h2 className="font-display text-lg tracking-wide text-[#111111]">
            Your Bag {count > 0 && <span className="text-sm text-[#88847D]">({count})</span>}
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close bag"
            className="text-[#111111] transition-colors hover:text-[#C3A46B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-[#C3A46B]" />
            <p className="font-display text-xl text-[#111111]">Your bag is empty</p>
            <p className="text-sm text-[#88847D]">
              Discover pieces designed to become part of your story.
            </p>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="mt-2 bg-[#111111] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F5F0] transition-colors hover:bg-[#C3A46B] hover:text-[#111111]"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-[#111111]/10 px-6 py-3">
              {remaining > 0 ? (
                <p className="text-xs text-[#88847D]">
                  You're{" "}
                  <span className="font-semibold text-[#111111]">{formatINR(remaining)}</span> away
                  from complimentary shipping.
                </p>
              ) : (
                <p className="text-xs font-semibold text-[#C3A46B]">
                  Complimentary shipping unlocked.
                </p>
              )}
              <div className="mt-2 h-1 w-full bg-[#E8E0D6]">
                <div
                  className="h-full bg-[#C3A46B] transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-[#111111]/8 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link
                    to="/product/$handle"
                    params={{ handle: item.handle }}
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-20 object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to="/product/$handle"
                          params={{ handle: item.handle }}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-[#111111] hover:text-[#C3A46B]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-[#88847D]">Size: {item.size}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#88847D] transition-colors hover:text-[#111111]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-[#111111]/15">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="px-2.5 py-1 text-[#111111] hover:text-[#C3A46B]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-[#111111]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-2.5 py-1 text-[#111111] hover:text-[#C3A46B]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-[#111111]">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#111111]/10 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#88847D]">Subtotal</span>
                <span className="text-sm font-semibold text-[#111111]">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-[#88847D]">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="mt-4 block bg-[#111111] py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F5F0] transition-colors hover:bg-[#C3A46B] hover:text-[#111111]"
              >
                Proceed to checkout
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="mt-3 w-full text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D] underline-offset-4 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
