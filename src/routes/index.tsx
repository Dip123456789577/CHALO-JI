import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Gem,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  CATEGORIES,
  COLLECTIONS,
  PRODUCTS,
  bestSellers,
  formatINR,
  newArrivals,
  productsByCategory,
  productsByCollection,
  type Product,
} from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { Eyebrow, LinkButton, RatingStars, SectionHeading } from "@/components/site/ui-bits";
import { useCartStore } from "@/stores/shop-store";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "AURELLE — Jewellery That Defines You" },
      {
        name: "description",
        content:
          "Discover AURELLE fine jewellery — rings, pearls, silver and statement pieces designed in India.",
      },
    ],
  }),
});

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=80";

function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const best = bestSellers();
  const fresh = newArrivals();
  const signature = productsByCollection("signature").slice(0, 4);
  const essentials = productsByCollection("essentials").slice(0, 4);
  const pearls = productsByCategory("pearls").slice(0, 4);
  const statement = productsByCollection("statement").slice(0, 4);
  const gift = productsByCollection("gift").slice(0, 4);
  const lookProducts = [best[0], best[2], fresh[0], pearls[0]].filter(Boolean) as Product[];

  const reviews = PRODUCTS.flatMap((p) => p.reviews.map((r) => ({ ...r, product: p }))).slice(0, 6);

  return (
    <SiteLayout>
      {/* 1. Cinematic hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[#111111] lg:min-h-screen">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="AURELLE signature campaign"
            className="slow-drift h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-[#111111]/20" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-20 pt-40 lg:px-10 lg:pb-28">
          <p className="hero-copy eyebrow mb-6 text-[#C3A46B]" style={{ animationDelay: "100ms" }}>
            The Signature Edit — 2026
          </p>
          <h1
            className="hero-copy font-display text-[13vw] leading-[0.95] tracking-tight text-[#F8F5F0] sm:text-7xl lg:text-8xl xl:text-9xl"
            style={{ animationDelay: "250ms" }}
          >
            BEYOND
            <br />
            BEAUTY.
            <br />
            <span className="text-[#C3A46B]">BEYOND TIME.</span>
          </h1>
          <p
            className="hero-copy mt-8 max-w-md text-sm leading-relaxed text-[#E8E0D6]/80 sm:text-base"
            style={{ animationDelay: "400ms" }}
          >
            Discover jewellery designed to become part of your story.
          </p>
          <div className="hero-copy mt-10 flex flex-wrap gap-4" style={{ animationDelay: "550ms" }}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-[#C3A46B] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#111111] transition-colors duration-300 hover:bg-[#F8F5F0]"
            >
              Explore collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/pages/$slug"
              params={{ slug: "about" }}
              className="inline-flex items-center gap-3 border border-[#F8F5F0]/40 px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] transition-colors duration-300 hover:bg-[#F8F5F0] hover:text-[#111111]"
            >
              Discover our world
            </Link>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-[#F8F5F0]/40 p-1.5">
            <div className="h-2 w-1 animate-bounce rounded-full bg-[#C3A46B]" />
          </div>
        </div>
      </section>

      {/* 2. Shop by category */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading
          eyebrow="The Collection"
          title="Shop by category"
          description="Nine worlds of fine jewellery, each with its own character."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 5).map((c, i) => {
            const product = PRODUCTS.find((p) => p.category === c.slug);
            return (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2 aspect-[3/4] sm:aspect-auto" : "aspect-[3/4]"}`}
              >
                {product && (
                  <img
                    src={product.images[0]}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-[#111111]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="font-display text-xl text-[#F8F5F0] lg:text-2xl">{c.name}</p>
                  <p className="mt-1 hidden text-xs text-[#E8E0D6]/70 sm:block">{c.blurb}</p>
                  <p className="editorial-link mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C3A46B] opacity-0 transition-opacity group-hover:opacity-100">
                    Explore →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.slice(5).map((c) => {
            const product = PRODUCTS.find((p) => p.category === c.slug);
            return (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className="group relative overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E8E0D6]/50">
                  {product && (
                    <img
                      src={product.images[0]}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] group-hover:text-[#C3A46B]">
                  {c.name}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured products rail */}
      <section className="bg-[#E8E0D6]/40 py-20 lg:py-28">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow="Most Wanted"
              title="Pieces the world keeps coming back for"
            />
            <LinkButton
              to="/collections/$slug"
              params={{ slug: "best-sellers" }}
              className="hidden sm:inline-flex"
            >
              View best sellers <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {best.slice(0, 4).map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <LinkButton to="/collections/$slug" params={{ slug: "best-sellers" }}>
              View best sellers
            </LinkButton>
          </div>
        </div>
      </section>

      {/* 4. Featured collection — Signature Edit */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={COLLECTIONS[0]!.image}
                alt={COLLECTIONS[0]!.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-48 border-4 border-[#F8F5F0] shadow-xl sm:block lg:-right-8 lg:w-64">
              <img
                src={signature[1]?.images[0] ?? COLLECTIONS[0]!.image}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <Eyebrow>The Signature Edit — 2026</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#111111] sm:text-5xl lg:text-6xl">
              Jewellery that becomes part of your story.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#88847D] sm:text-base">
              The Signature Collection is where restraint meets permanence — architectural forms in
              warm metals, finished by hand and built to be worn for decades.
            </p>
            <ul className="mt-8 space-y-3">
              {signature.slice(0, 3).map((p) => (
                <li
                  key={p.handle}
                  className="flex items-center justify-between border-b border-[#111111]/10 pb-3"
                >
                  <Link
                    to="/product/$handle"
                    params={{ handle: p.handle }}
                    className="text-sm font-medium text-[#111111] hover:text-[#C3A46B]"
                  >
                    {p.name}
                  </Link>
                  <span className="text-sm text-[#88847D]">{formatINR(p.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <LinkButton to="/collections/$slug" params={{ slug: "signature" }}>
                Shop signature <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/shop">Shop all</LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Editorial showcase — dark band */}
      <section className="relative overflow-hidden bg-[#111111] py-24 text-[#F8F5F0] lg:py-36">
        <div className="absolute inset-0 opacity-30">
          <img
            src={COLLECTIONS[3]!.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Statement Pieces</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              For the moments that demand attention.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#E8E0D6]/70 sm:text-base">
              Bold forms, sculptural silhouettes and stones that catch the light — pieces that start
              conversations.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {statement.map((p) => (
              <div key={p.handle} className="group">
                <Link to="/product/$handle" params={{ handle: p.handle }} className="block">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#F8F5F0]">{p.name}</p>
                  <p className="text-xs text-[#E8E0D6]/60">{formatINR(p.price)}</p>
                </Link>
                <button
                  onClick={() =>
                    addItem({
                      handle: p.handle,
                      name: p.name,
                      image: p.images[0]!,
                      price: p.price,
                      size: p.sizes[0] ?? "One Size",
                    })
                  }
                  className="mt-2 w-full border border-[#F8F5F0]/25 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F8F5F0] transition-colors hover:border-[#C3A46B] hover:text-[#C3A46B]"
                >
                  Quick add
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Shop the look */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading
          eyebrow="Shop the Look"
          title="One story, four pieces"
          description="Curated together by our stylists — mix, match and make it yours."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {lookProducts.map((p, i) => (
            <div key={p.handle} className={`group relative ${i % 2 === 1 ? "lg:mt-10" : ""}`}>
              <Link to="/product/$handle" params={{ handle: p.handle }} className="block">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111111]">{p.name}</p>
                  <p className="text-xs text-[#88847D]">{formatINR(p.price)}</p>
                </div>
                <button
                  onClick={() =>
                    addItem({
                      handle: p.handle,
                      name: p.name,
                      image: p.images[0]!,
                      price: p.price,
                      size: p.sizes[0] ?? "One Size",
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#111111]/20 text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F8F5F0]"
                  aria-label={`Add ${p.name} to bag`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Everyday essentials */}
      <section className="bg-[#E8E0D6]/40 py-20 lg:py-28">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow="Everyday Essentials"
              title="Fine jewellery for daily ritual"
            />
            <LinkButton
              to="/collections/$slug"
              params={{ slug: "essentials" }}
              className="hidden sm:inline-flex"
            >
              Shop essentials <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {essentials.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Personality collection */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden">
            <img
              src={COLLECTIONS[4]!.image}
              alt="Gift collection"
              className="aspect-[4/3] w-full object-cover lg:aspect-[16/10]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <Eyebrow className="text-[#C3A46B]">The Gift Collection</Eyebrow>
              <h3 className="mt-2 font-display text-3xl text-[#F8F5F0]">
                Considered presents, beautifully boxed.
              </h3>
              <Link
                to="/collections/$slug"
                params={{ slug: "gift" }}
                className="editorial-link mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B]"
              >
                Shop gifts →
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              src={COLLECTIONS[5]!.image}
              alt="Best sellers"
              className="aspect-[4/3] w-full object-cover lg:aspect-[16/10]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <Eyebrow className="text-[#C3A46B]">Most Wanted</Eyebrow>
              <h3 className="mt-2 font-display text-3xl text-[#F8F5F0]">
                The pieces everyone asks about.
              </h3>
              <Link
                to="/collections/$slug"
                params={{ slug: "best-sellers" }}
                className="editorial-link mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B]"
              >
                Shop best sellers →
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {gift.slice(0, 4).map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </section>

      {/* 9. New arrivals */}
      <section className="bg-[#111111] py-20 text-[#F8F5F0] lg:py-28">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading align="left" dark eyebrow="Just Landed" title="New arrivals" />
            <LinkButton to="/shop" search={{ sort: "newest" }} className="hidden sm:inline-flex">
              View all <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {fresh.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. Reviews */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading eyebrow="Let customers speak" title="Worn, loved, kept." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="flex flex-col border border-[#111111]/10 bg-white/40 p-7">
              <RatingStars rating={r.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#111111]/80">
                “{r.body}”
              </blockquote>
              <figcaption className="mt-6 border-t border-[#111111]/10 pt-4">
                <p className="text-sm font-medium text-[#111111]">{r.author}</p>
                <Link
                  to="/product/$handle"
                  params={{ handle: r.product.handle }}
                  className="editorial-link mt-1 inline-block text-xs text-[#88847D] hover:text-[#C3A46B]"
                >
                  {r.product.name}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 11. Brand promises */}
      <section className="border-y border-[#111111]/10 bg-[#E8E0D6]/40 py-16">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-6 lg:grid-cols-4 lg:px-10">
          {[
            {
              icon: ShieldCheck,
              title: "1-Year Warranty",
              body: "Every piece covered against manufacturing defects.",
            },
            {
              icon: Truck,
              title: "Insured Shipping",
              body: "Complimentary above ₹1,999, insured everywhere.",
            },
            { icon: RotateCcw, title: "Easy Returns", body: "14-day returns on unworn pieces." },
            {
              icon: Gem,
              title: "Hallmarked Quality",
              body: "Sterling silver 925 and verified vermeil.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C3A46B]/40 text-[#C3A46B]">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#111111]">
                {title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#88847D]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Social gallery */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading eyebrow="@aurelle.jewels" title="Worn by you" />
        <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PRODUCTS.slice(0, 6).map((p) => (
            <a
              key={p.handle}
              href="https://instagram.com/aurelle.jewels"
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/0 opacity-0 transition-all duration-300 group-hover:bg-[#111111]/40 group-hover:opacity-100">
                <ArrowUpRight className="h-6 w-6 text-[#F8F5F0]" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 13. Editorial CTA */}
      <section className="relative overflow-hidden">
        <img
          src={COLLECTIONS[2]!.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#111111]/60" />
        <div className="relative mx-auto flex max-w-[1600px] flex-col items-center px-6 py-28 text-center lg:py-40">
          <Sparkles className="h-8 w-8 text-[#C3A46B]" />
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-[#F8F5F0] sm:text-5xl lg:text-6xl">
            The Signature Edit — 2026 is here.
          </h2>
          <p className="mt-6 max-w-md text-sm text-[#E8E0D6]/80 sm:text-base">
            Limited pieces. Permanent pieces. Discover the collection before it becomes someone
            else's story.
          </p>
          <LinkButton to="/collections/$slug" params={{ slug: "signature" }} dark className="mt-10">
            Explore the edit <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </section>
    </SiteLayout>
  );
}
