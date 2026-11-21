import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COLLECTIONS, productsByCollection, type CollectionSlug } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { Eyebrow, LinkButton } from "@/components/site/ui-bits";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const collection = COLLECTIONS.find((c) => c.slug === params.slug);
    if (!collection) throw notFound();
    const { getStoreProducts } = await import("@/lib/server-fns");
    const result = await getStoreProducts({ data: { collection: params.slug, limit: 96 } });
    const products = result.products.length
      ? result.products
      : productsByCollection(collection.slug as CollectionSlug);
    return { collection, products };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.collection.name} — AURELLE` },
          { name: "description", content: loaderData.collection.description },
        ]
      : [],
  }),
  component: CollectionPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-32 text-center lg:px-10">
        <p className="eyebrow text-[#C3A46B]">404</p>
        <h1 className="mt-3 font-display text-4xl text-[#111111]">Collection not found.</h1>
        <Link
          to="/shop"
          className="mt-8 inline-flex bg-[#111111] px-10 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F8F5F0] hover:bg-[#C3A46B] hover:text-[#111111]"
        >
          Shop all
        </Link>
      </div>
    </SiteLayout>
  ),
});

function CollectionPage() {
  const { collection, products } = Route.useLoaderData();
  const others = COLLECTIONS.filter((c) => c.slug !== collection.slug).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-[#111111]">
        <img
          src={collection.image}
          alt={collection.name}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-16 pt-32 lg:px-10 lg:pb-24">
          <Eyebrow className="text-[#C3A46B]">AURELLE Collection</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-[#F8F5F0] sm:text-6xl lg:text-7xl">
            {collection.name}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#E8E0D6]/80 sm:text-base">
            {collection.description}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#E8E0D6]/60">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-24">
        {products.length === 0 ? (
          <div className="border border-dashed border-[#111111]/20 py-24 text-center">
            <p className="font-display text-2xl text-[#111111]">
              This collection is being restocked.
            </p>
            <LinkButton to="/shop" className="mt-8">
              Browse all jewellery
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Other collections */}
      <section className="border-t border-[#111111]/10 bg-[#E8E0D6]/40 py-16 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow>Keep exploring</Eyebrow>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-[#111111] sm:text-4xl">
                More collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="editorial-link hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C3A46B] sm:flex"
            >
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group relative block overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="font-display text-xl text-[#F8F5F0]">{c.name}</p>
                  <p className="mt-1 text-xs text-[#E8E0D6]/70">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
