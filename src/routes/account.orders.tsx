import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Package } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";

export const Route = createFileRoute("/account/orders")({
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: "Order History — AURELLE" },
      { name: "description", content: "Your AURELLE order history." },
    ],
  }),
});

function OrdersPage() {
  const orders = useCartStore((s) => s.orders);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-24">
        <Link
          to="/account"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D] hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" /> Account
        </Link>

        <Eyebrow>Order history</Eyebrow>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
          Your orders
        </h1>

        {orders.length === 0 ? (
          <div className="mt-16 border border-dashed border-[#111111]/20 py-24 text-center">
            <Package className="mx-auto h-10 w-10 text-[#88847D]" />
            <p className="mt-4 font-display text-2xl text-[#111111]">No orders yet.</p>
            <p className="mt-2 text-sm text-[#88847D]">
              When you place an order, it will appear here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex bg-[#111111] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] hover:bg-[#C3A46B] hover:text-[#111111]"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-[#111111]/10 border-y border-[#111111]/10">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/order/$orderId"
                params={{ orderId: o.id }}
                className="flex flex-col gap-3 py-6 transition-colors hover:bg-[#E8E0D6]/30 sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#111111]">{o.id}</p>
                  <p className="mt-0.5 text-xs text-[#88847D]">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {o.items.length} {o.items.length === 1 ? "item" : "items"}
                    {" · "}
                    {o.address.city}, {o.address.state}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#111111]">{formatINR(o.total)}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-[#C3A46B]">
                      {o.status}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D]">
                    Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
