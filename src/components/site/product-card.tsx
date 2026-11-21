import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { discountPercent, formatINR, type Product } from "@/lib/catalog";
import { useCartStore } from "@/stores/shop-store";
import { cn } from "@/lib/utils";
import { RatingStars } from "./ui-bits";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const wished = wishlist.includes(product.handle);
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative" style={{ animationDelay: `${index * 40}ms` }}>
      <Link
        to="/product/$handle"
        params={{ handle: product.handle }}
        className="block"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden bg-[#E8E0D6]/40">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              aria-hidden
              className="absolute inset-0 aspect-[3/4] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount && (
              <span className="bg-[#111111] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#F8F5F0]">
                −{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#C3A46B] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
                New
              </span>
            )}
          </div>
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5F0]/70">
              <span className="eyebrow text-[#111111]">Sold out</span>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product.handle)}
        aria-label={
          wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
        aria-pressed={wished}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F5F0]/90 backdrop-blur transition-all duration-300 hover:scale-110",
          wished ? "text-[#C3A46B]" : "text-[#111111]",
        )}
      >
        <Heart className={cn("h-4 w-4", wished && "fill-[#C3A46B]")} />
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/product/$handle"
            params={{ handle: product.handle }}
            className="block truncate text-sm font-medium text-[#111111] transition-colors hover:text-[#C3A46B]"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-[#88847D]">{product.material}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-[11px] text-[#88847D]">({product.reviewCount})</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium text-[#111111]">{formatINR(product.price)}</p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-xs text-[#88847D] line-through">
              {formatINR(product.compareAtPrice)}
            </p>
          )}
        </div>
      </div>

      {!outOfStock && (
        <button
          onClick={() =>
            addItem({
              handle: product.handle,
              name: product.name,
              image: product.images[0]!,
              price: product.price,
              size: product.sizes[0] ?? "One Size",
            })
          }
          className="mt-3 flex w-full items-center justify-center gap-2 border border-[#111111]/20 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111] opacity-0 transition-all duration-300 hover:border-[#111111] hover:bg-[#111111] hover:text-[#F8F5F0] group-hover:opacity-100 focus:opacity-100 max-lg:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" /> Quick add
        </button>
      )}
      {outOfStock && (
        <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88847D]">
          Notify me
        </p>
      )}
    </article>
  );
}
