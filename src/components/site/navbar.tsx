import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { CATEGORIES, COLLECTIONS, PRODUCTS, type CategorySlug } from "@/lib/catalog";
import { useCartStore, cartCount } from "@/stores/shop-store";
import { cn } from "@/lib/utils";

const SHOP_LINKS: { label: string; to: string; category?: CategorySlug }[] = [
  { label: "Shop All", to: "/shop" },
  ...CATEGORIES.map((c) => ({ label: c.name, to: "/shop", category: c.slug })),
];

function MegaPanel({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-0 top-full z-50 w-full transition-all duration-300",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
      )}
      onMouseEnter={() => {}}
    >
      <div
        className={cn(
          "border-t border-[#111111]/10 bg-[#F8F5F0]/95 shadow-[0_30px_60px_-20px_rgba(17,17,17,0.25)] backdrop-blur-md",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"shop" | "collections" | null>(null);
  const items = useCartStore((s) => s.items);
  const wishlist = useCartStore((s) => s.wishlist);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const setSearchOpen = useCartStore((s) => s.setSearchOpen);
  const mobileMenuOpen = useCartStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useCartStore((s) => s.setMobileMenuOpen);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const featured = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 3);
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 3);

  const dark = scrolled || pathname !== "/";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          dark
            ? "bg-[#F8F5F0]/95 shadow-[0_1px_0_rgba(17,17,17,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <nav
          className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-10"
          aria-label="Primary"
        >
          {/* Left links */}
          <div className="hidden flex-1 items-center gap-8 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("shop")}
              onFocus={() => setOpenMenu("shop")}
            >
              <button
                className={cn(
                  "eyebrow flex items-center gap-1 transition-colors",
                  dark ? "text-[#111111]" : "text-[#F8F5F0]",
                )}
                aria-expanded={openMenu === "shop"}
                aria-haspopup="true"
              >
                Shop
                <span
                  className={cn(
                    "text-[9px] transition-transform duration-300",
                    openMenu === "shop" && "rotate-180",
                  )}
                >
                  ▾
                </span>
              </button>
            </div>
            <div
              className="relative"
              onMouseEnter={() => setOpenMenu("collections")}
              onFocus={() => setOpenMenu("collections")}
            >
              <button
                className={cn(
                  "eyebrow flex items-center gap-1 transition-colors",
                  dark ? "text-[#111111]" : "text-[#F8F5F0]",
                )}
                aria-expanded={openMenu === "collections"}
                aria-haspopup="true"
              >
                Collections
                <span
                  className={cn(
                    "text-[9px] transition-transform duration-300",
                    openMenu === "collections" && "rotate-180",
                  )}
                >
                  ▾
                </span>
              </button>
            </div>
            <Link
              to="/shop"
              search={{ sort: "newest" }}
              className={cn(
                "eyebrow transition-colors",
                dark ? "text-[#111111]" : "text-[#F8F5F0]",
              )}
            >
              New Arrivals
            </Link>
          </div>

          {/* Mobile left */}
          <button
            className={cn("lg:hidden", dark ? "text-[#111111]" : "text-[#F8F5F0]")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Center wordmark */}
          <Link
            to="/"
            className={cn(
              "font-display text-xl tracking-[0.35em] transition-colors sm:text-2xl",
              dark ? "text-[#111111]" : "text-[#F8F5F0]",
            )}
            aria-label="AURELLE home"
          >
            AURELLE
          </Link>

          {/* Right icons */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "transition-colors",
                dark
                  ? "text-[#111111] hover:text-[#C3A46B]"
                  : "text-[#F8F5F0] hover:text-[#C3A46B]",
              )}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/account"
              className={cn(
                "hidden transition-colors sm:block",
                dark
                  ? "text-[#111111] hover:text-[#C3A46B]"
                  : "text-[#F8F5F0] hover:text-[#C3A46B]",
              )}
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/wishlist"
              className={cn(
                "relative transition-colors",
                dark
                  ? "text-[#111111] hover:text-[#C3A46B]"
                  : "text-[#F8F5F0] hover:text-[#C3A46B]",
              )}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C3A46B] text-[9px] font-bold text-[#111111]">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative transition-colors",
                dark
                  ? "text-[#111111] hover:text-[#C3A46B]"
                  : "text-[#F8F5F0] hover:text-[#C3A46B]",
              )}
              aria-label="Shopping bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount(items) > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C3A46B] text-[9px] font-bold text-[#111111]">
                  {cartCount(items)}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mega menus */}
        <MegaPanel open={openMenu === "shop"}>
          <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-6 py-10 lg:px-10">
            <div className="col-span-12 lg:col-span-4">
              <p className="eyebrow mb-4 text-[#88847D]">Shop by category</p>
              <ul className="space-y-2.5">
                {SHOP_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      search={l.category ? { category: l.category } : {}}
                      className="group flex items-baseline justify-between text-sm text-[#111111] transition-colors hover:text-[#C3A46B]"
                    >
                      <span className="font-medium">{l.label}</span>
                      <span className="text-[#88847D] opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <p className="eyebrow mb-4 text-[#88847D]">Best sellers</p>
              <ul className="space-y-4">
                {featured.map((p) => (
                  <li key={p.handle}>
                    <Link
                      to="/product/$handle"
                      params={{ handle: p.handle }}
                      className="group flex items-center gap-4"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-16 w-16 object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#111111] group-hover:text-[#C3A46B]">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#88847D]">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <p className="eyebrow mb-4 text-[#88847D]">New arrivals</p>
              <ul className="space-y-4">
                {newArrivals.map((p) => (
                  <li key={p.handle}>
                    <Link
                      to="/product/$handle"
                      params={{ handle: p.handle }}
                      className="group flex items-center gap-4"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-16 w-16 object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#111111] group-hover:text-[#C3A46B]">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#88847D]">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/shop"
                search={{ sort: "newest" }}
                className="editorial-link mt-6 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#111111]"
              >
                View all new arrivals
              </Link>
            </div>
          </div>
        </MegaPanel>

        <MegaPanel open={openMenu === "collections"}>
          <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
              {COLLECTIONS.map((c) => (
                <Link
                  key={c.slug}
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group"
                >
                  <div className="overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#111111] group-hover:text-[#C3A46B]">
                    {c.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </MegaPanel>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#111111] transition-all duration-300 lg:hidden",
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span className="font-display text-xl tracking-[0.35em] text-[#F8F5F0]">AURELLE</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="text-[#F8F5F0]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8 flex flex-col gap-1 px-6">
          <MobileLink to="/shop" label="Shop All" onClick={() => setMobileMenuOpen(false)} />
          <p className="eyebrow mt-6 text-[#C3A46B]">Categories</p>
          {CATEGORIES.map((c) => (
            <MobileLink
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              label={c.name}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
          <p className="eyebrow mt-6 text-[#C3A46B]">Collections</p>
          {COLLECTIONS.map((c) => (
            <MobileLink
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              label={c.name}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
          <MobileLink
            to="/shop"
            search={{ sort: "newest" }}
            label="New Arrivals"
            onClick={() => setMobileMenuOpen(false)}
          />
          <MobileLink to="/wishlist" label="Wishlist" onClick={() => setMobileMenuOpen(false)} />
          <MobileLink to="/account" label="Account" onClick={() => setMobileMenuOpen(false)} />
        </nav>
      </div>
    </>
  );
}

function MobileLink({
  to,
  label,
  onClick,
  search,
  params,
}: {
  to: string;
  label: string;
  onClick: () => void;
  search?: Record<string, string>;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      params={params as never}
      onClick={onClick}
      className="border-b border-[#F8F5F0]/10 py-3 font-display text-2xl text-[#F8F5F0] transition-colors hover:text-[#C3A46B]"
    >
      {label}
    </Link>
  );
}
