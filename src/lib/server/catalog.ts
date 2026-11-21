// Server-only catalog query helpers — map Prisma rows to the frontend Product shape.
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const productInclude = {
  images: { orderBy: { position: "asc" as const } },
  variants: true,
  category: true,
  collection: true,
  reviews: { orderBy: { createdAt: "desc" as const }, take: 20 },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function serializeProduct(p: ProductWithRelations) {
  const images = p.images.map((i) => i.url);
  const sizes = p.variants.map((v) => v.size);
  const rating = p.reviews.length
    ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
    : 0;
  return {
    id: p.id,
    handle: p.slug,
    name: p.name,
    category: p.category.slug,
    categoryName: p.category.name,
    collections: p.collection ? [p.collection.slug] : [],
    collectionName: p.collection?.name ?? null,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice !== null ? Number(p.compareAtPrice) : undefined,
    material: p.material ?? "",
    color: p.color ?? "",
    sizes: sizes.length ? sizes : ["One Size"],
    images: images.length ? images : [""],
    description: p.description,
    details: [] as string[],
    stock: p.stock,
    isNew: p.isNew,
    isBestSeller: p.bestseller,
    featured: p.featured,
    published: p.published,
    rating: Math.round(rating * 10) / 10,
    reviewCount: p.reviews.length,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      author: r.authorName,
      rating: r.rating,
      title: r.title ?? "",
      body: r.body,
      date: r.createdAt.toISOString().slice(0, 10),
      verified: r.verified,
    })),
    sku: p.sku ?? undefined,
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
  };
}

export interface ProductQuery {
  category?: string | undefined;
  collection?: string | undefined;
  q?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  material?: string | undefined;
  inStock?: boolean | undefined;
  featured?: boolean | undefined;
  bestseller?: boolean | undefined;
  isNew?: boolean | undefined;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | "popular" | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  publishedOnly?: boolean | undefined;
}

export async function queryProducts(q: ProductQuery) {
  const where: Prisma.ProductWhereInput = {};
  if (q.publishedOnly !== false) where.published = true;
  if (q.category) where.category = { slug: q.category };
  if (q.collection) where.collection = { slug: q.collection };
  if (q.featured) where.featured = true;
  if (q.bestseller) where.bestseller = true;
  if (q.isNew) where.isNew = true;
  if (q.inStock) where.stock = { gt: 0 };
  if (q.material) where.material = { contains: q.material, mode: "insensitive" };
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = {
      ...(q.minPrice !== undefined ? { gte: q.minPrice } : {}),
      ...(q.maxPrice !== undefined ? { lte: q.maxPrice } : {}),
    };
  }
  if (q.q) {
    where.OR = [
      { name: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
      { material: { contains: q.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    q.sort === "price-asc"
      ? { price: "asc" }
      : q.sort === "price-desc"
        ? { price: "desc" }
        : q.sort === "newest"
          ? { createdAt: "desc" }
          : { createdAt: "desc" };

  const page = Math.max(1, q.page ?? 1);
  const limit = Math.min(48, Math.max(1, q.limit ?? 24));

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    products: products.map(serializeProduct),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  return product ? serializeProduct(product) : null;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCollections() {
  return prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
