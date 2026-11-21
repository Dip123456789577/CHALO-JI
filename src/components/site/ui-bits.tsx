import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/catalog";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return <p className={cn("eyebrow text-[#C3A46B]", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && <Eyebrow className={dark ? "text-[#C3A46B]" : undefined}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl",
          dark ? "text-[#F8F5F0]" : "text-[#111111]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed sm:text-base",
            dark ? "text-[#E8E0D6]/80" : "text-[#88847D]",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function Price({
  price,
  compareAtPrice,
  className,
  dark = false,
}: {
  price: number;
  compareAtPrice?: number | undefined;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("text-sm font-medium", dark ? "text-[#F8F5F0]" : "text-[#111111]")}>
        {formatINR(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className={cn("text-xs line-through", dark ? "text-[#E8E0D6]/50" : "text-[#88847D]")}>
          {formatINR(compareAtPrice)}
        </span>
      )}
    </div>
  );
}

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < Math.round(rating) ? "fill-[#C3A46B] text-[#C3A46B]" : "text-[#E8E0D6]",
          )}
        />
      ))}
    </span>
  );
}

export function GoldButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-[#C3A46B] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-[#F8F5F0] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 border border-[#111111] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-[#F8F5F0] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  children,
  className,
  dark = false,
  params,
  search,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  params?: Record<string, string>;
  search?: Record<string, string>;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      search={search as never}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
        dark
          ? "border border-[#F8F5F0]/40 text-[#F8F5F0] hover:bg-[#F8F5F0] hover:text-[#111111]"
          : "border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F8F5F0]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
