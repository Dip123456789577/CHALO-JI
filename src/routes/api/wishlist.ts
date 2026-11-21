import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  productSlug: z.string().min(1),
  variantId: z.string().uuid().optional(),
});

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export const Route = createFileRoute("/api/wishlist")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const wishlist = await prisma.wishlist.findUnique({
          where: { userId: user.id },
          include: {
            items: {
              include: {
                product: {
                  include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
                },
                variant: true,
              },
            },
          },
        });
        const items = (wishlist?.items ?? []).map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          name: i.product.name,
          slug: i.product.slug,
          price: Number(i.product.price),
          image: i.product.images[0]?.url ?? null,
          size: i.variant?.size ?? null,
          stock: i.variant ? i.variant.stock : i.product.stock,
        }));
        return json({ items });
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());

        const product = await prisma.product.findUnique({ where: { slug: body.data.productSlug } });
        if (!product) return apiError(404, "Product not found");

        const wishlist = await getOrCreateWishlist(user.id);
        const existing = await prisma.wishlistItem.findFirst({
          where: {
            wishlistId: wishlist.id,
            productId: product.id,
            variantId: body.data.variantId ?? null,
          },
        });
        if (existing) return json({ ok: true, alreadyExists: true });

        await prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId: product.id,
            variantId: body.data.variantId ?? null,
          },
        });
        return json({ ok: true }, { status: 201 });
      },
    },
  },
});
