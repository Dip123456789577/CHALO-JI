// Server functions bridging the storefront to Neon via Prisma.
// Every function falls back to the static catalog when the database is
// unreachable or unseeded, so the storefront never breaks without credentials.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  PRODUCTS,
  CATEGORIES,
  COLLECTIONS,
  productsByCategory,
  productsByCollection,
  getProduct,
  type Product,
} from "@/lib/catalog";

async function db() {
  if (!process.env["DATABASE_URL"]) return null;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    // Cheap connectivity probe.
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

function toStaticProduct(p: Product) {
  return p;
}

export const getStoreProducts = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        category: z.string().optional(),
        collection: z.string().optional(),
        q: z.string().optional(),
        sort: z.string().optional(),
        limit: z.number().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const prisma = await db();
    if (!prisma) {
      // Static fallback
      let list = [...PRODUCTS];
      if (data?.category) list = productsByCategory(data.category as never);
      if (data?.collection) list = productsByCollection(data.collection as never);
      if (data?.q) {
        const q = data.q.toLowerCase();
        list = list.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
        );
      }
      return { products: list.slice(0, data?.limit ?? 48), source: "static" as const };
    }

    const { queryProducts } = await import("@/lib/server/catalog");
    const result = await queryProducts({
      category: data?.category,
      collection: data?.collection,
      q: data?.q,
      sort: (data?.sort as never) ?? undefined,
      limit: data?.limit ?? 48,
      publishedOnly: true,
    });
    return { products: result.products as unknown as Product[], source: "db" as const };
  });

export const getStoreProduct = createServerFn({ method: "GET" })
  .inputValidator(z.object({ handle: z.string() }))
  .handler(async ({ data }) => {
    const prisma = await db();
    if (!prisma) {
      const p = getProduct(data.handle);
      return p
        ? { product: toStaticProduct(p), source: "static" as const }
        : { product: null, source: "static" as const };
    }
    const { getProductBySlug } = await import("@/lib/server/catalog");
    const product = await getProductBySlug(data.handle);
    return { product: product as unknown as Product | null, source: "db" as const };
  });

export const getStoreCategories = createServerFn({ method: "GET" }).handler(async () => {
  const prisma = await db();
  if (!prisma) {
    return {
      categories: CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, blurb: c.blurb })),
      source: "static" as const,
    };
  }
  const { getCategories } = await import("@/lib/server/catalog");
  const cats = await getCategories();
  return {
    categories: cats.map((c) => ({ slug: c.slug, name: c.name, blurb: c.blurb })),
    source: "db" as const,
  };
});

export const getStoreCollections = createServerFn({ method: "GET" }).handler(async () => {
  const prisma = await db();
  if (!prisma) {
    return {
      collections: COLLECTIONS.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image,
      })),
      source: "static" as const,
    };
  }
  const { getCollections } = await import("@/lib/server/catalog");
  const cols = await getCollections();
  return {
    collections: cols.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
    })),
    source: "db" as const,
  };
});
