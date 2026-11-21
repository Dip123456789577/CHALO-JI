import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Eyebrow } from "@/components/site/ui-bits";

const PAGES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping & Delivery",
    body: [
      "Every AURELLE order ships fully insured via our courier partner, in our signature keepsake packaging.",
      "Orders above ₹1,999 ship complimentary. Below that, a flat ₹99 applies at checkout.",
      "Metro cities receive orders in 2–4 business days; the rest of India in 4–7 business days. You'll receive tracking the moment your piece leaves our atelier.",
      "We currently ship across India. International shipping is available on request — write to hello@aurelle.example.",
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    body: [
      "We offer a 14-day return window on unworn pieces in original packaging. To start a return, write to hello@aurelle.example with your order ID.",
      "Refunds are processed to the original payment method within 5–7 business days of us receiving the returned piece.",
      "Exchanges for a different size or piece are always free — we cover both shipments.",
      "Made-to-order and engraved pieces are final sale, as noted on the product page.",
    ],
  },
  warranty: {
    title: "Warranty & Care",
    body: [
      "Every AURELLE piece carries a 1-year craftsmanship warranty covering manufacturing defects — not normal wear, loss or damage.",
      "Store your pieces in the included pouch, away from moisture and perfume.",
      "Wipe gently with a soft cloth after wear. Avoid contact with chlorine, household chemicals and abrasive surfaces.",
      "Gold vermeil and silver may naturally tarnish over time — this is part of their character and can be polished back to shine.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "AURELLE collects only the information needed to fulfil your order: name, contact details, shipping address and payment confirmation.",
      "We never sell or share your data with third parties for marketing. Payment processing is handled by PCI-DSS compliant providers.",
      "Newsletter subscriptions are optional and can be unsubscribed at any time via the link in every email.",
      "This is a demo storefront — no real personal data is collected or stored.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By using AURELLE you agree to these terms. All products are original designs; imagery is for illustration.",
      "Prices are in Indian Rupees and include applicable taxes unless stated otherwise.",
      "We reserve the right to discontinue pieces without notice. If an item becomes unavailable after purchase, you will receive a full refund.",
      "This is a demonstration storefront built for development purposes.",
    ],
  },
  contact: {
    title: "Contact Us",
    body: [
      "We'd love to hear from you. Write to hello@aurelle.example and a member of the atelier will reply within one business day.",
      "For order support, include your order ID (found in your confirmation email).",
      "For press and collaborations, write to press@aurelle.example.",
      "AURELLE Atelier — Mumbai, India",
    ],
  },
};

export const Route = createFileRoute("/pages/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.page.title} — AURELLE` }] : [],
  }),
  component: PageView,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-32 text-center lg:px-10">
        <h1 className="font-display text-4xl text-[#111111]">Page not found.</h1>
        <Link
          to="/"
          className="mt-8 inline-flex bg-[#111111] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] hover:bg-[#C3A46B] hover:text-[#111111]"
        >
          Back home
        </Link>
      </div>
    </SiteLayout>
  ),
});

function PageView() {
  const { page } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
        <Eyebrow>AURELLE</Eyebrow>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
          {page.title}
        </h1>
        <div className="mt-8 space-y-5">
          {page.body.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-[#111111]/80 sm:text-base">
              {para}
            </p>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
