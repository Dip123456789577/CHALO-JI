import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveCart, cartWithItems } from "@/lib/server/cart";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  productSlug: z.string().min(1),
  variantId: z.string().uuid().optional(),
  size: z.string().max(40).optional(),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const Route = createFileRoute("/api/cart/items")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const resolved = await resolveCart(request);
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid item", body.error.flatten());
        const d = body.data;

        const product = await prisma.product.findUnique({
          where: { slug: d.productSlug },
          include: { variants: true },
        });
        if (!product || !product.published) return apiError(404, "Product not found");

        // Resolve variant by id or size label.
        let variantId: string | null = null;
        let stock = product.stock;
        if (d.variantId || d.size) {
          const variant = product.variants.find(
            (v) => (d.variantId && v.id === d.variantId) || (d.size && v.size === d.size),
          );
          if (!variant) return apiError(400, "Unknown size/variant");
          variantId = variant.id;
          stock = variant.stock;
        }
        if (stock <= 0) return apiError(409, "Out of stock");

        // Upsert cart item — never trust client prices.
        const existing = await prisma.cartItem.findFirst({
          where: { cartId: resolved.cartId, productId: product.id, variantId },
        });
        const newQty = (existing?.quantity ?? 0) + d.quantity;
        if (newQty > stock) return apiError(409, `Only ${stock} in stock`);

        if (existing) {
          await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: resolved.cartId,
              productId: product.id,
              variantId,
              quantity: d.quantity,
            },
          });
        }

        const cart = await cartWithItems(resolved.cartId);
        const headers: Record<string, string> = {};
        if (resolved.setCookieHeader) headers["set-cookie"] = resolved.setCookieHeader;
        return json({ cart }, { status: 201, headers });
      },
    },
  },
});
