import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getProductBySlug, serializeProduct, productInclude } from "@/lib/server/catalog";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  material: z.string().max(120).nullable().optional(),
  color: z.string().max(60).nullable().optional(),
  categorySlug: z.string().min(1).optional(),
  collectionSlug: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
  images: z.array(z.string().url()).optional(),
  sizes: z.array(z.string().min(1).max(40)).optional(),
});

async function findProduct(handle: string) {
  // Resolve by slug first, then by UUID.
  const bySlug = await prisma.product.findUnique({ where: { slug: handle } });
  if (bySlug) return bySlug;
  if (/^[0-9a-f-]{36}$/i.test(handle)) {
    return prisma.product.findUnique({ where: { id: handle } });
  }
  return null;
}

export const Route = createFileRoute("/api/products/$handle")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const product = await getProductBySlug(params.handle);
        if (!product) return apiError(404, "Product not found");
        return json({ product });
      },
      PATCH: async ({ request, params }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const existing = await findProduct(params.handle);
        if (!existing) return apiError(404, "Product not found");

        const body = patchSchema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());
        const d = body.data;

        const data: Record<string, unknown> = {};
        if (d.name !== undefined) data["name"] = d.name;
        if (d.description !== undefined) data["description"] = d.description;
        if (d.price !== undefined) data["price"] = d.price;
        if (d.compareAtPrice !== undefined) data["compareAtPrice"] = d.compareAtPrice;
        if (d.material !== undefined) data["material"] = d.material;
        if (d.color !== undefined) data["color"] = d.color;
        if (d.stock !== undefined) data["stock"] = d.stock;
        if (d.published !== undefined) data["published"] = d.published;
        if (d.featured !== undefined) data["featured"] = d.featured;
        if (d.bestseller !== undefined) data["bestseller"] = d.bestseller;
        if (d.isNew !== undefined) data["isNew"] = d.isNew;
        if (d.seoTitle !== undefined) data["seoTitle"] = d.seoTitle;
        if (d.seoDescription !== undefined) data["seoDescription"] = d.seoDescription;

        if (d.categorySlug) {
          const cat = await prisma.category.findUnique({ where: { slug: d.categorySlug } });
          if (!cat) return apiError(400, "Unknown category");
          data["categoryId"] = cat.id;
        }
        if (d.collectionSlug !== undefined) {
          if (d.collectionSlug === null) {
            data["collectionId"] = null;
          } else {
            const col = await prisma.collection.findUnique({ where: { slug: d.collectionSlug } });
            if (!col) return apiError(400, "Unknown collection");
            data["collectionId"] = col.id;
          }
        }

        await prisma.$transaction(async (tx) => {
          await tx.product.update({ where: { id: existing.id }, data });
          if (d.images) {
            await tx.productImage.deleteMany({ where: { productId: existing.id } });
            await tx.productImage.createMany({
              data: d.images.map((url, i) => ({ productId: existing.id, url, position: i })),
            });
          }
          if (d.sizes) {
            const existingVariants = await tx.productVariant.findMany({
              where: { productId: existing.id },
            });
            const keep = new Set(d.sizes);
            for (const v of existingVariants) {
              if (!keep.has(v.size)) {
                await tx.productVariant.delete({ where: { id: v.id } });
              }
            }
            for (const size of d.sizes) {
              await tx.productVariant.upsert({
                where: { productId_size: { productId: existing.id, size } },
                create: { productId: existing.id, size, stock: d.stock ?? existing.stock },
                update: {},
              });
            }
          }
        });

        const product = await prisma.product.findUniqueOrThrow({
          where: { id: existing.id },
          include: productInclude,
        });
        return json({ product: serializeProduct(product) });
      },
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const existing = await findProduct(params.handle);
        if (!existing) return apiError(404, "Product not found");
        await prisma.product.delete({ where: { id: existing.id } });
        return json({ ok: true });
      },
    },
  },
});
