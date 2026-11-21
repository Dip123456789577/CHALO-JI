import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { resolveCart, cartWithItems } from "@/lib/server/cart";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({ quantity: z.number().int().min(0).max(20) });

export const Route = createFileRoute("/api/cart/items/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const resolved = await resolveCart(request);
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid quantity");

        const item = await prisma.cartItem.findFirst({
          where: { id: params.id, cartId: resolved.cartId },
          include: { variant: true, product: true },
        });
        if (!item) return apiError(404, "Cart item not found");

        const stock = item.variant ? item.variant.stock : item.product.stock;
        if (body.data.quantity > stock) return apiError(409, `Only ${stock} in stock`);

        if (body.data.quantity === 0) {
          await prisma.cartItem.delete({ where: { id: item.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: body.data.quantity },
          });
        }
        const cart = await cartWithItems(resolved.cartId);
        return json({ cart });
      },
      DELETE: async ({ request, params }) => {
        const resolved = await resolveCart(request);
        const item = await prisma.cartItem.findFirst({
          where: { id: params.id, cartId: resolved.cartId },
        });
        if (!item) return apiError(404, "Cart item not found");
        await prisma.cartItem.delete({ where: { id: item.id } });
        const cart = await cartWithItems(resolved.cartId);
        return json({ cart });
      },
    },
  },
});
