import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow, LinkButton } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";

export const Route = createFileRoute("/order/$orderId")({
  component: OrderPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-32 text-center lg:px-10">
        <h1 className="font-display text-4xl text-[#111111]">Order not found.</h1>
        <LinkButton to="/shop" className="mt-8">
          Continue shopping
        </LinkButton>
      </div>
    </SiteLayout>
  ),
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const orders = useCartStore((s) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  if (!order) throw notFound();

  const statusSteps = ["confirmed", "processing", "shipped", "delivered"] as const;
  const currentIndex = statusSteps.indexOf(order.status as (typeof statusSteps)[number]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
        {/* Confirmation header */}
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#C3A46B]" />
          <Eyebrow className="mt-6">Order confirmed</Eyebrow>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
            Thank you — it's yours.
          </h1>
          <p className="mt-4 text-sm text-[#88847D]">
            Order <span className="font-semibold text-[#111111]">{order.id}</span> ·{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-2 text-xs text-[#88847D]">
            A confirmation has been sent to {order.email}
          </p>
        </div>

        {/* Status tracker */}
        <div className="mt-12 border border-[#111111]/10 bg-white/50 p-6">
          <div className="flex items-start justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-1 flex-col items-center">
                {i < statusSteps.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-4 h-px w-full ${i < currentIndex ? "bg-[#C3A46B]" : "bg-[#111111]/10"}`}
                  />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold uppercase ${
                    i <= currentIndex
                      ? "border-[#C3A46B] bg-[#C3A46B] text-[#111111]"
                      : "border-[#111111]/15 bg-[#F8F5F0] text-[#88847D]"
                  }`}
                >
                  {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    i <= currentIndex ? "text-[#111111]" : "text-[#88847D]"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mt-10 border border-[#111111]/10">
          <div className="border-b border-[#111111]/10 bg-[#E8E0D6]/40 px-6 py-4">
            <p className="eyebrow text-[#111111]">Order details</p>
          </div>
          <ul className="divide-y divide-[#111111]/10">
            {order.items.map((item) => (
              <li key={`${item.handle}-${item.size}`} className="flex items-center gap-4 px-6 py-4">
                <div className="h-16 w-14 shrink-0 overflow-hidden bg-[#E8E0D6]/40">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#111111]">{item.name}</p>
                  <p className="text-xs text-[#88847D]">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-[#111111]">{formatINR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#111111]/10 px-6 py-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#88847D]">Subtotal</dt>
                <dd className="text-[#111111]">{formatINR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#88847D]">Shipping</dt>
                <dd className="text-[#111111]">
                  {order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[#111111]/10 pt-2">
                <dt className="font-semibold text-[#111111]">Total paid</dt>
                <dd className="font-semibold text-[#111111]">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Delivery + payment info */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="border border-[#111111]/10 p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#C3A46B]" />
              <p className="eyebrow text-[#111111]">Delivery</p>
            </div>
            <address className="mt-3 text-sm not-italic leading-relaxed text-[#111111]/80">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              <span className="text-[#88847D]">{order.address.phone}</span>
            </address>
          </div>
          <div className="border border-[#111111]/10 p-6">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#C3A46B]" />
              <p className="eyebrow text-[#111111]">Payment</p>
            </div>
            <p className="mt-3 text-sm text-[#111111]/80">
              {order.paymentMethod === "razorpay" && "UPI / Cards / NetBanking"}
              {order.paymentMethod === "cod" && "Cash on Delivery"}
              {order.paymentMethod === "demo" && "Demo checkout"}
              <br />
              <span className="text-[#88847D]">
                Status:{" "}
                {order.paymentStatus === "paid"
                  ? "Paid"
                  : order.paymentStatus === "demo"
                    ? "Demo"
                    : "Pending"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <LinkButton to="/shop">Continue shopping</LinkButton>
        </div>
      </div>
    </SiteLayout>
  );
}
