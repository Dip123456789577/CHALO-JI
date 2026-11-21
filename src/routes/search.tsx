import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { searchProducts } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { LinkButton } from "@/components/site/ui-bits";

interface SearchParams {
  q?: string | undefined;
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: (search["q"] as string | undefined) || undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    if (!deps.q)
      return {
        results: [] as Awaited<ReturnType<typeof searchProducts>>,
        source: "static" as const,
      };
    const { getStoreProducts } = await import("@/lib/server-fns");
    const result = await getStoreProducts({ data: { q: deps.q, limit: 48 } });
    return {
      results: (result.products.length ? result.products : searchProducts(deps.q)) as Awaited<
        ReturnType<typeof searchProducts>
      >,
      source: result.source,
    };
  },
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "Search — AURELLE" },
      { name: "description", content: "Search the AURELLE collection." },
    ],
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { results } = Route.useLoaderData();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-24">
        <p className="eyebrow text-[#C3A46B]">Search</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl">
          {q ? `Results for “${q}”` : "Search the collection"}
        </h1>
        <p className="mt-3 text-sm text-[#88847D]">
          {q
            ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found`
            : "Try a piece name, material or category."}
        </p>

        {!q ? (
          <div className="mt-16 border border-dashed border-[#111111]/20 py-24 text-center">
            <SearchX className="mx-auto h-10 w-10 text-[#88847D]" />
            <p className="mt-4 font-display text-2xl text-[#111111]">Enter a search term.</p>
            <LinkButton to="/shop" className="mt-8">
              Browse all jewellery
            </LinkButton>
          </div>
        ) : results.length === 0 ? (
          <div className="mt-16 border border-dashed border-[#111111]/20 py-24 text-center">
            <p className="font-display text-2xl text-[#111111]">No pieces match “{q}”.</p>
            <p className="mt-2 text-sm text-[#88847D]">
              Try a different term or browse the full collection.
            </p>
            <LinkButton to="/shop" className="mt-8">
              Shop all
            </LinkButton>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {results.map((p, i) => (
              <ProductCard key={p.handle} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
