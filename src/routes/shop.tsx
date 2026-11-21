import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, PRODUCTS, formatINR, type CategorySlug, type Product } from "@/lib/catalog";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

interface ShopSearch {
  category?: CategorySlug | undefined;
  q?: string | undefined;
  sort?: SortKey | undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: (search["category"] as CategorySlug | undefined) || undefined,
    q: (search["q"] as string | undefined) || undefined,
    sort: (search["sort"] as SortKey | undefined) || undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category, q: search.q, sort: search.sort }),
  loader: async ({ deps }) => {
    try {
      const { getStoreProducts } = await import("@/lib/server-fns");
      const result = await getStoreProducts({
        data: { category: deps.category, q: deps.q, sort: deps.sort, limit: 96 },
      });
      return { products: result.products, source: result.source };
    } catch (e) {
      console.error("[shop loader]", e);
      const { PRODUCTS } = await import("@/lib/catalog");
      return { products: PRODUCTS, source: "static" as const };
    }
  },
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop All Jewellery — AURELLE" },
      {
        name: "description",
        content:
          "Browse the full AURELLE collection — rings, necklaces, bracelets, pearls and silver.",
      },
    ],
  }),
});

const PRICE_BANDS = [
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000+", min: 10000, max: Infinity },
];

const MATERIALS = ["Sterling Silver 925", "18k Gold Vermeil", "Freshwater Pearl", "Gold Plated"];

function ShopPage() {
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const [priceBand, setPriceBand] = useState<number | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const category = search.category;
  const sort: SortKey = search.sort ?? "featured";
  const query = search.q?.toLowerCase() ?? "";

  const filtered = useMemo(() => {
    let list: Product[] = [...loaderData.products];

    if (category) list = list.filter((p) => p.category === category);

    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.material.toLowerCase().includes(query) ||
          p.category.includes(query),
      );
    }

    if (priceBand !== null) {
      const band = PRICE_BANDS[priceBand];
      if (band) list = list.filter((p) => p.price >= band.min && p.price < band.max);
    }

    if (materials.length > 0) {
      list = list.filter((p) =>
        materials.some((m) => p.material.includes(m.replace(/ \d+k.*/, "")) || p.material === m),
      );
    }

    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => Number(b.isBestSeller ?? false) - Number(a.isBestSeller ?? false));
    }

    return list;
  }, [loaderData.products, category, query, priceBand, materials, inStockOnly, sort]);

  const categoryName = category ? CATEGORIES.find((c) => c.slug === category)?.name : null;

  const setCategory = (slug?: CategorySlug) =>
    navigate({ search: { category: slug, q: search.q, sort: search.sort } });

  const setSort = (s: SortKey) =>
    navigate({ search: { category: search.category, q: search.q, sort: s } });

  const clearFilters = () => {
    setPriceBand(null);
    setMaterials([]);
    setInStockOnly(false);
  };

  const hasFilters = priceBand !== null || materials.length > 0 || inStockOnly;

  const filterPanel = (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <p className="eyebrow mb-4 text-[#111111]">Category</p>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setCategory(undefined)}
              className={cn(
                "text-sm transition-colors",
                !category
                  ? "font-semibold text-[#C3A46B]"
                  : "text-[#111111]/70 hover:text-[#111111]",
              )}
            >
              All jewellery
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "text-sm transition-colors",
                  category === c.slug
                    ? "font-semibold text-[#C3A46B]"
                    : "text-[#111111]/70 hover:text-[#111111]",
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <p className="eyebrow mb-4 text-[#111111]">Price</p>
        <ul className="space-y-2">
          {PRICE_BANDS.map((band, i) => (
            <li key={band.label}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#111111]/70">
                <input
                  type="radio"
                  name="price-band"
                  checked={priceBand === i}
                  onChange={() => setPriceBand(priceBand === i ? null : i)}
                  className="accent-[#C3A46B]"
                />
                {band.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Material */}
      <div>
        <p className="eyebrow mb-4 text-[#111111]">Material</p>
        <ul className="space-y-2">
          {MATERIALS.map((m) => (
            <li key={m}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#111111]/70">
                <input
                  type="checkbox"
                  checked={materials.includes(m)}
                  onChange={() =>
                    setMaterials((prev) =>
                      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
                    )
                  }
                  className="accent-[#C3A46B]"
                />
                {m}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#111111]/70">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="accent-[#C3A46B]"
        />
        In stock only
      </label>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#88847D] hover:text-[#111111]"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      {/* Page header */}
      <section className="border-b border-[#111111]/10 bg-[#E8E0D6]/40">
        <div className="mx-auto max-w-[1600px] px-6 py-14 lg:px-10 lg:py-20">
          <p className="eyebrow text-[#C3A46B]">The Collection</p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
            {query ? `Results for “${search.q}”` : (categoryName ?? "Shop All")}
          </h1>
          <p className="mt-3 text-sm text-[#88847D]">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            {categoryName ? ` in ${categoryName}` : ""}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>

          {/* Grid */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <button
                onClick={() => setMobileFilters(true)}
                className="flex items-center gap-2 border border-[#111111]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <div className="ml-auto flex items-center gap-3">
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#88847D] underline underline-offset-4 hover:text-[#111111] lg:hidden"
                  >
                    Clear
                  </button>
                )}
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#88847D]">
                  Sort
                  <span className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="appearance-none border border-[#111111]/20 bg-transparent py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] focus:outline-none"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#88847D]" />
                  </span>
                </label>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-[#111111]/20 py-24 text-center">
                <p className="font-display text-2xl text-[#111111]">
                  Nothing matches those filters.
                </p>
                <p className="mt-2 text-sm text-[#88847D]">
                  Try widening your price range or clearing a filter.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 border border-[#111111] px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] hover:bg-[#111111] hover:text-[#F8F5F0]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.handle} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-[#111111]/50"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-[#F8F5F0] p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-xl text-[#111111]">Filters</p>
              <button onClick={() => setMobileFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-[#111111]" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-8 w-full bg-[#111111] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F5F0]"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
