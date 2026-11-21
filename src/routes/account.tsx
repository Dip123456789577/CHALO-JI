import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Heart, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Account — AURELLE" },
      { name: "description", content: "Your AURELLE orders and saved pieces." },
    ],
  }),
});

function AccountPage() {
  const orders = useCartStore((s) => s.orders);
  const wishlist = useCartStore((s) => s.wishlist);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-24">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
          Welcome back.
        </h1>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Orders card */}
          <Link
            to="/account/orders"
            className="group border border-[#111111]/10 bg-white/50 p-8 transition-colors hover:border-[#C3A46B]"
          >
            <Package className="h-8 w-8 text-[#C3A46B]" />
            <h2 className="mt-4 font-display text-2xl text-[#111111]">Orders</h2>
            <p className="mt-2 text-sm text-[#88847D]">
              {orders.length === 0
                ? "No orders yet — your story starts here."
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B]">
              View orders{" "}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Wishlist card */}
          <Link
            to="/wishlist"
            className="group border border-[#111111]/10 bg-white/50 p-8 transition-colors hover:border-[#C3A46B]"
          >
            <Heart className="h-8 w-8 text-[#C3A46B]" />
            <h2 className="mt-4 font-display text-2xl text-[#111111]">Wishlist</h2>
            <p className="mt-2 text-sm text-[#88847D]">
              {wishlist.length === 0
                ? "Save pieces you love for later."
                : `${wishlist.length} saved ${wishlist.length === 1 ? "piece" : "pieces"}`}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B]">
              View wishlist{" "}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Recent orders preview */}
        {orders.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl text-[#111111]">Recent orders</h2>
              <Link
                to="/account/orders"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B] hover:text-[#111111]"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 divide-y divide-[#111111]/10 border-y border-[#111111]/10">
              {orders.slice(0, 3).map((o) => (
                <Link
                  key={o.id}
                  to="/order/$orderId"
                  params={{ orderId: o.id }}
                  className="flex items-center justify-between py-5 transition-colors hover:bg-[#E8E0D6]/30"
                >
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{o.id}</p>
                    <p className="mt-0.5 text-xs text-[#88847D]">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {o.items.length} {o.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#111111]">{formatINR(o.total)}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-[#C3A46B]">
                      {o.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
