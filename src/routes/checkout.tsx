import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE, formatINR } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow, GoldButton } from "@/components/site/ui-bits";
import { cartSubtotal, useCartStore, type OrderAddress } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — AURELLE" },
      { name: "description", content: "Secure checkout for your AURELLE order." },
    ],
  }),
});

type PaymentMethod = "razorpay" | "cod" | "demo";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
];

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const placeOrder = useCartStore((s) => s.placeOrder);

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<OrderAddress>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  const set =
    (field: keyof OrderAddress) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setAddress((a) => ({ ...a, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs["email"] = "Enter a valid email";
    if (!address.fullName.trim()) errs["fullName"] = "Required";
    if (!address.phone.trim() || address.phone.replace(/\D/g, "").length < 10)
      errs["phone"] = "Enter a valid phone";
    if (!address.line1.trim()) errs["line1"] = "Required";
    if (!address.city.trim()) errs["city"] = "Required";
    if (!address.state) errs["state"] = "Select a state";
    if (!/^\d{6}$/.test(address.pincode)) errs["pincode"] = "6-digit PIN code";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate() || placing) return;
    setPlacing(true);
    // Simulated payment processing delay for demo checkout
    setTimeout(() => {
      const order = placeOrder({ email, address, paymentMethod });
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    }, 900);
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-32 text-center lg:px-10">
          <h1 className="font-display text-4xl text-[#111111]">Your bag is empty.</h1>
          <Link
            to="/shop"
            className="mt-8 inline-flex bg-[#111111] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] hover:bg-[#C3A46B] hover:text-[#111111]"
          >
            Continue shopping
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const inputCls = (field: string) =>
    cn(
      "w-full border bg-white/60 px-4 py-3 text-sm text-[#111111] placeholder:text-[#88847D]/60 focus:outline-none focus:ring-1",
      errors[field]
        ? "border-[#B45309] focus:border-[#B45309] focus:ring-[#B45309]"
        : "border-[#111111]/20 focus:border-[#C3A46B] focus:ring-[#C3A46B]",
    );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          to="/cart"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#88847D] hover:text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to bag
        </Link>

        <div className="mb-10">
          <Eyebrow>Secure checkout</Eyebrow>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
            Almost yours.
          </h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div className="space-y-10">
            {/* Contact */}
            <section>
              <h2 className="font-display text-xl text-[#111111]">Contact</h2>
              <div className="mt-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls("email")}
                />
                {errors["email"] && (
                  <p className="mt-1 text-xs text-[#B45309]">{errors["email"]}</p>
                )}
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="font-display text-xl text-[#111111]">Shipping address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    placeholder="Full name"
                    value={address.fullName}
                    onChange={set("fullName")}
                    className={inputCls("fullName")}
                  />
                  {errors["fullName"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["fullName"]}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="Phone (10 digits)"
                    value={address.phone}
                    onChange={set("phone")}
                    className={inputCls("phone")}
                  />
                  {errors["phone"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["phone"]}</p>
                  )}
                </div>
                <div>
                  <input
                    placeholder="PIN code"
                    value={address.pincode}
                    onChange={set("pincode")}
                    maxLength={6}
                    className={inputCls("pincode")}
                  />
                  {errors["pincode"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["pincode"]}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    placeholder="Address line 1"
                    value={address.line1}
                    onChange={set("line1")}
                    className={inputCls("line1")}
                  />
                  {errors["line1"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["line1"]}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <input
                    placeholder="Address line 2 (optional)"
                    value={address.line2 ?? ""}
                    onChange={set("line2")}
                    className={inputCls("line2")}
                  />
                </div>
                <div>
                  <input
                    placeholder="City"
                    value={address.city}
                    onChange={set("city")}
                    className={inputCls("city")}
                  />
                  {errors["city"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["city"]}</p>
                  )}
                </div>
                <div>
                  <select
                    value={address.state}
                    onChange={set("state")}
                    className={inputCls("state")}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors["state"] && (
                    <p className="mt-1 text-xs text-[#B45309]">{errors["state"]}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-display text-xl text-[#111111]">Payment</h2>
              <div className="mt-4 space-y-3">
                {[
                  {
                    id: "razorpay" as PaymentMethod,
                    label: "UPI / Cards / NetBanking",
                    sub: "Powered by Razorpay — instant confirmation",
                  },
                  {
                    id: "cod" as PaymentMethod,
                    label: "Cash on Delivery",
                    sub: "Pay when your piece arrives",
                  },
                  {
                    id: "demo" as PaymentMethod,
                    label: "Demo checkout",
                    sub: "Simulated payment for development",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 border p-4 transition-colors",
                      paymentMethod === m.id
                        ? "border-[#C3A46B] bg-[#C3A46B]/5"
                        : "border-[#111111]/15 hover:border-[#111111]/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-[#C3A46B]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#111111]">{m.label}</span>
                      <span className="block text-xs text-[#88847D]">{m.sub}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#111111]/10 bg-white/50 p-6">
              <p className="eyebrow mb-5 text-[#111111]">Order summary</p>
              <ul className="max-h-64 space-y-3 overflow-y-auto">
                {items.map((i) => (
                  <li key={i.key} className="flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-[#E8E0D6]/40">
                      <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      <span className="absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center bg-[#111111] text-[9px] text-[#F8F5F0]">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#111111]">{i.name}</p>
                      <p className="text-[11px] text-[#88847D]">Size {i.size}</p>
                    </div>
                    <p className="text-xs text-[#111111]">{formatINR(i.price * i.quantity)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-[#111111]/10 pt-4 text-sm">
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
              <GoldButton onClick={handlePlaceOrder} disabled={placing} className="mt-6 w-full">
                {placing ? "Processing…" : `Pay ${formatINR(total)}`}
              </GoldButton>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#88847D]">
                <Lock className="h-3 w-3" /> 256-bit encrypted · PCI-DSS compliant
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#88847D]">
                <ShieldCheck className="h-3 w-3 text-[#C3A46B]" /> Every order ships fully insured
              </p>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
