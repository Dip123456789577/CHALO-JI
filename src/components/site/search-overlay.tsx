import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { CATEGORIES, PRODUCTS, searchProducts } from "@/lib/catalog";
import { useCartStore } from "@/stores/shop-store";
import { formatINR } from "@/lib/catalog";

const POPULAR = ["ring", "pearl", "silver", "bracelet", "necklace"];

export function SearchOverlay() {
  const open = useCartStore((s) => s.searchOpen);
  const setOpen = useCartStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const results = query.trim() ? searchProducts(query).slice(0, 6) : [];
  const suggestions = query.trim() ? [] : PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div
      className={`fixed inset-0 z-[80] bg-[#111111]/60 backdrop-blur-sm transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className={`mx-auto mt-16 max-w-3xl px-4 transition-all duration-500 sm:mt-24 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#F8F5F0] shadow-2xl">
          <div className="flex items-center gap-4 border-b border-[#111111]/10 px-6 py-5">
            <Search className="h-5 w-5 shrink-0 text-[#C3A46B]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rings, pearls, silver…"
              className="w-full bg-transparent font-display text-xl text-[#111111] placeholder:text-[#88847D]/60 focus:outline-none sm:text-2xl"
              aria-label="Search products"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close search"
              className="text-[#88847D] hover:text-[#111111]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            {!query.trim() && (
              <>
                <p className="eyebrow mb-3 text-[#88847D]">Browse categories</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      to="/shop"
                      search={{ category: c.slug }}
                      onClick={() => setOpen(false)}
                      className="border border-[#111111]/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-[#111111] transition-colors hover:border-[#C3A46B] hover:text-[#C3A46B]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <p className="eyebrow mb-3 text-[#88847D]">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <button
                      key={p}
                      onClick={() => setQuery(p)}
                      className="text-sm text-[#88847D] underline-offset-4 transition-colors hover:text-[#111111] hover:underline"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {suggestions.length > 0 && (
                  <>
                    <p className="eyebrow mb-3 mt-6 text-[#88847D]">Most wanted</p>
                    <ul className="divide-y divide-[#111111]/8">
                      {suggestions.map((p) => (
                        <li key={p.handle}>
                          <Link
                            to="/product/$handle"
                            params={{ handle: p.handle }}
                            onClick={() => setOpen(false)}
                            className="group flex items-center justify-between py-3"
                          >
                            <span className="text-sm text-[#111111] group-hover:text-[#C3A46B]">
                              {p.name}
                            </span>
                            <span className="text-xs text-[#88847D]">{formatINR(p.price)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {query.trim() && results.length === 0 && (
              <div className="py-8 text-center">
                <p className="font-display text-lg text-[#111111]">No pieces found for “{query}”</p>
                <p className="mt-2 text-sm text-[#88847D]">
                  Try a different search, or browse the categories above.
                </p>
                <Link
                  to="/shop"
                  search={{ q: query }}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] underline-offset-4 hover:underline"
                >
                  View all results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {results.length > 0 && (
              <>
                <p className="eyebrow mb-3 text-[#88847D]">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </p>
                <ul className="divide-y divide-[#111111]/8">
                  {results.map((p) => (
                    <li key={p.handle}>
                      <Link
                        to="/product/$handle"
                        params={{ handle: p.handle }}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-4 py-3"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-14 w-12 object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#111111] group-hover:text-[#C3A46B]">
                            {p.name}
                          </p>
                          <p className="text-xs text-[#88847D]">{p.category}</p>
                        </div>
                        <span className="text-xs text-[#88847D]">{formatINR(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/shop"
                  search={{ q: query }}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] underline-offset-4 hover:underline"
                >
                  View all results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
