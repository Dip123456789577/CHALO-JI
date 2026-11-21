import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { CATEGORIES, COLLECTIONS } from "@/lib/catalog";
import { NewsletterForm } from "./newsletter-form";

const HELP_LINKS = [
  { label: "Contact Us", to: "/pages/$slug", params: { slug: "contact" } },
  { label: "Shipping Policy", to: "/pages/$slug", params: { slug: "shipping" } },
  { label: "Returns & Exchanges", to: "/pages/$slug", params: { slug: "returns" } },
  { label: "Warranty", to: "/pages/$slug", params: { slug: "warranty" } },
  { label: "FAQs", to: "/pages/$slug", params: { slug: "faqs" } },
  { label: "Track Your Order", to: "/pages/$slug", params: { slug: "order-tracking" } },
];

const COMPANY_LINKS = [
  { label: "About AURELLE", to: "/pages/$slug", params: { slug: "about" } },
  { label: "Privacy Policy", to: "/pages/$slug", params: { slug: "privacy" } },
  { label: "Terms & Conditions", to: "/pages/$slug", params: { slug: "terms" } },
  { label: "My Account", to: "/account" },
  { label: "Wishlist", to: "/wishlist" },
];

export function Footer() {
  return (
    <footer className="bg-[#111111] text-[#E8E0D6]">
      {/* Trust strip */}
      <div className="border-b border-[#F8F5F0]/10">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3 lg:px-10">
          {[
            ["1-Year Warranty", "Every piece is covered against manufacturing defects."],
            ["Secure Payments", "UPI, cards and net banking via Razorpay."],
            ["Insured Shipping", "Every order ships fully insured across India."],
          ].map(([title, body]) => (
            <div key={title} className="text-center sm:text-left">
              <p className="eyebrow text-[#C3A46B]">{title}</p>
              <p className="mt-2 text-sm text-[#E8E0D6]/70">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <p className="font-display text-2xl tracking-[0.35em] text-[#F8F5F0]">AURELLE</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#E8E0D6]/70">
              Jewellery That Defines You. Fine pieces designed in India, made for the moments that
              matter.
            </p>
            <div className="mt-8 max-w-sm">
              <p className="eyebrow mb-4 text-[#C3A46B]">The AURELLE Letter</p>
              <NewsletterForm dark />
            </div>
            <div className="mt-8 flex gap-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center border border-[#F8F5F0]/20 text-[#E8E0D6]/70 transition-colors hover:border-[#C3A46B] hover:text-[#C3A46B]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <p className="eyebrow mb-5 text-[#C3A46B]">Shop</p>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/shop"
                  className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                >
                  Shop All
                </Link>
              </li>
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug }}
                    className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div className="lg:col-span-2">
            <p className="eyebrow mb-5 text-[#C3A46B]">Collections</p>
            <ul className="space-y-3">
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: c.slug }}
                    className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help + Company */}
          <div className="lg:col-span-3">
            <p className="eyebrow mb-5 text-[#C3A46B]">Help</p>
            <ul className="space-y-3">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    params={l.params as never}
                    className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-5 mt-8 text-[#C3A46B]">Company</p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  {"params" in l ? (
                    <Link
                      to={l.to}
                      params={l.params as never}
                      className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <Link
                      to={l.to}
                      className="text-sm text-[#E8E0D6]/70 transition-colors hover:text-[#F8F5F0]"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F8F5F0]/10">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-[#E8E0D6]/50 sm:flex-row lg:px-10">
          <p>
            © {new Date().getFullYear()} AURELLE. All rights reserved. Jewellery That Defines You.
          </p>
          <p className="flex items-center gap-2">
            Crafted in India <span className="text-[#C3A46B]">✦</span> Secure checkout{" "}
            <span className="text-[#C3A46B]">✦</span> Insured delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
