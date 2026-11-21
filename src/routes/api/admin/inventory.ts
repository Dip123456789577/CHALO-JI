import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

export const Route = createFileRoute("/api/admin/inventory")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const products = await prisma.product.findMany({
          where: { published: true },
          select: {
            id: true,
            slug: true,
            name: true,
            sku: true,
            stock: true,
            price: true,
            variants: { select: { id: true, size: true, stock: true, sku: true } },
          },
          orderBy: { stock: "asc" },
        });
        return json({
          products: products.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            price: Number(p.price),
            variants: p.variants,
          })),
        });
      },
      PATCH: async ({ request }) => {
        const sessionUser = await getSessionUser(request);
        const auth = requireRole(sessionUser, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;
        const user = auth;

        const body = z
          .object({
            productId: z.string().uuid(),
            stock: z.number().int().min(0).optional(),
            variantId: z.string().uuid().optional(),
            variantStock: z.number().int().min(0).optional(),
          })
          .safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());
        const d = body.data;

        await prisma.$transaction(async (tx) => {
          if (d.stock !== undefined) {
            await tx.product.update({ where: { id: d.productId }, data: { stock: d.stock } });
          }
          if (d.variantId && d.variantStock !== undefined) {
            await tx.productVariant.update({
              where: { id: d.variantId },
              data: { stock: d.variantStock },
            });
          }
          await tx.adminActivityLog.create({
            data: {
              adminId: user.id,
              action: "inventory.update",
              entity: "Product",
              entityId: d.productId,
              metadata: { stock: d.stock, variantId: d.variantId, variantStock: d.variantStock },
            },
          });
        });
        return json({ ok: true });
      },
    },
  },
});
