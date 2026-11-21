import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { queryProducts, serializeProduct, productInclude } from "@/lib/server/catalog";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const createSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  sku: z.string().max(60).optional(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  material: z.string().max(120).optional(),
  color: z.string().max(60).optional(),
  categorySlug: z.string().min(1),
  collectionSlug: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  images: z.array(z.string().url()).default([]),
  sizes: z.array(z.string().min(1).max(40)).default([]),
});

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const num = (k: string) => {
          const v = url.searchParams.get(k);
          return v !== null ? Number(v) : undefined;
        };
        const result = await queryProducts({
          category: url.searchParams.get("category") ?? undefined,
          collection: url.searchParams.get("collection") ?? undefined,
          q: url.searchParams.get("q") ?? undefined,
          minPrice: num("minPrice"),
          maxPrice: num("maxPrice"),
          material: url.searchParams.get("material") ?? undefined,
          inStock: url.searchParams.get("inStock") === "true" ? true : undefined,
          featured: url.searchParams.get("featured") === "true" ? true : undefined,
          bestseller: url.searchParams.get("bestseller") === "true" ? true : undefined,
          isNew: url.searchParams.get("isNew") === "true" ? true : undefined,
          sort: (url.searchParams.get("sort") as never) ?? undefined,
          page: num("page"),
          limit: num("limit"),
        });
        return json(result);
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const body = createSchema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid product payload", body.error.flatten());
        const d = body.data;

        const category = await prisma.category.findUnique({ where: { slug: d.categorySlug } });
        if (!category) return apiError(400, "Unknown category");
        const collection = d.collectionSlug
          ? await prisma.collection.findUnique({ where: { slug: d.collectionSlug } })
          : null;
        if (d.collectionSlug && !collection) return apiError(400, "Unknown collection");

        try {
          const created = await prisma.product.create({
            data: {
              slug: d.slug,
              sku: d.sku ?? null,
              name: d.name,
              description: d.description,
              price: d.price,
              compareAtPrice: d.compareAtPrice ?? null,
              material: d.material ?? null,
              color: d.color ?? null,
              categoryId: category.id,
              collectionId: collection?.id ?? null,
              stock: d.stock,
              published: d.published,
              featured: d.featured,
              bestseller: d.bestseller,
              isNew: d.isNew,
              seoTitle: d.seoTitle ?? null,
              seoDescription: d.seoDescription ?? null,
              images: { create: d.images.map((url, i) => ({ url, position: i })) },
              variants: { create: d.sizes.map((size) => ({ size, stock: d.stock })) },
            },
          });
          const product = await prisma.product.findUniqueOrThrow({
            where: { id: created.id },
            include: productInclude,
          });
          return json({ product: serializeProduct(product) }, { status: 201 });
        } catch (e) {
          if (String(e).includes("Unique constraint"))
            return apiError(409, "Slug or SKU already exists");
          throw e;
        }
      },
    },
  },
});
