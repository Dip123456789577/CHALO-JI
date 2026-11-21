import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Package, ShoppingBag, Users } from "lucide-react";
import { PRODUCTS, formatINR } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — AURELLE" }, { name: "robots", content: "noindex" }],
  }),
});

type Tab = "overview" | "orders" | "products" | "subscribers";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const orders = useCartStore((s) => s.orders);
  const [newsletter, setNewsletter] = useState<string[]>([]);

  useEffect(() => {
    try {
      setNewsletter(JSON.parse(localStorage.getItem("aurelle-newsletter") ?? "[]"));
    } catch {
      setNewsletter([]);
    }
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const items = orders.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.quantity, 0), 0);
    return { revenue, items, orders: orders.length };
  }, [orders]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: `Orders (${orders.length})` },
    { id: "products", label: `Products (${PRODUCTS.length})` },
    { id: "subscribers", label: `Subscribers (${newsletter.length})` },
  ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D] hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>

        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Atelier dashboard</Eyebrow>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
              Admin
            </h1>
          </div>
          <p className="text-xs text-[#88847D]">Demo storefront — data lives in your browser.</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-[#111111]/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                tab === t.id
                  ? "border-[#C3A46B] text-[#111111]"
                  : "border-transparent text-[#88847D] hover:text-[#111111]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShoppingBag, label: "Total orders", value: String(stats.orders) },
                { icon: Package, label: "Pieces sold", value: String(stats.items) },
                { icon: Users, label: "Subscribers", value: String(newsletter.length) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-[#111111]/10 bg-white/50 p-6">
                  <Icon className="h-5 w-5 text-[#C3A46B]" />
                  <p className="mt-4 font-display text-3xl text-[#111111]">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#88847D]">{label}</p>
                </div>
              ))}
            </div>
            <div className="border border-[#111111]/10 bg-white/50 p-6">
              <p className="eyebrow mb-2 text-[#111111]">Gross revenue</p>
              <p className="font-display text-4xl text-[#111111]">{formatINR(stats.revenue)}</p>
              <p className="mt-2 text-xs text-[#88847D]">
                Across all orders in this browser session.
              </p>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="border border-dashed border-[#111111]/20 py-24 text-center">
                <p className="font-display text-2xl text-[#111111]">No orders yet.</p>
                <p className="mt-2 text-sm text-[#88847D]">
                  Orders placed in this session will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#111111]/10">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#111111]/10 bg-[#E8E0D6]/40">
                      {["Order", "Date", "Customer", "Items", "Total", "Status", "Payment"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#88847D]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/10">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#E8E0D6]/20">
                        <td className="px-4 py-3 font-medium text-[#111111]">
                          <Link
                            to="/order/$orderId"
                            params={{ orderId: o.id }}
                            className="hover:text-[#C3A46B]"
                          >
                            {o.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-[#88847D]">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-[#111111]">{o.address.fullName}</td>
                        <td className="px-4 py-3 text-[#88847D]">
                          {o.items.reduce((n, i) => n + i.quantity, 0)}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#111111]">
                          {formatINR(o.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-[#C3A46B]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#88847D]">{o.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {tab === "products" && (
          <div className="overflow-x-auto border border-[#111111]/10">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#111111]/10 bg-[#E8E0D6]/40">
                  {["Product", "Category", "Price", "Stock", "Rating", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#88847D]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/10">
                {PRODUCTS.map((p) => (
                  <tr key={p.handle} className="hover:bg-[#E8E0D6]/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="h-10 w-10 object-cover" />
                        <div>
                          <p className="font-medium text-[#111111]">{p.name}</p>
                          <p className="text-xs text-[#88847D]">/{p.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#88847D]">{p.category}</td>
                    <td className="px-4 py-3 text-[#111111]">{formatINR(p.price)}</td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        p.stock === 0 ? "text-[#B45309]" : "text-[#111111]",
                      )}
                    >
                      {p.stock === 0 ? "Sold out" : p.stock}
                    </td>
                    <td className="px-4 py-3 text-[#88847D]">
                      {p.rating.toFixed(1)} ({p.reviewCount})
                    </td>
                    <td className="px-4 py-3">
                      {p.isBestSeller && (
                        <span className="mr-1 bg-[#111111] px-2 py-1 text-[10px] font-semibold uppercase text-[#F8F5F0]">
                          Best
                        </span>
                      )}
                      {p.isNew && (
                        <span className="bg-[#C3A46B] px-2 py-1 text-[10px] font-semibold uppercase text-[#111111]">
                          New
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Subscribers */}
        {tab === "subscribers" && (
          <div>
            {newsletter.length === 0 ? (
              <div className="border border-dashed border-[#111111]/20 py-24 text-center">
                <p className="font-display text-2xl text-[#111111]">No subscribers yet.</p>
                <p className="mt-2 text-sm text-[#88847D]">Newsletter signups will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#111111]/10">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#111111]/10 bg-[#E8E0D6]/40">
                      {["Email", "Subscribed"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#88847D]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/10">
                    {newsletter.map((email) => (
                      <tr key={email} className="hover:bg-[#E8E0D6]/20">
                        <td className="px-4 py-3 text-[#111111]">{email}</td>
                        <td className="px-4 py-3 text-[#88847D]">Local signup</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
