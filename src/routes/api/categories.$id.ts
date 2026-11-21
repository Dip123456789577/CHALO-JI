import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  blurb: z.string().max(300).nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export const Route = createFileRoute("/api/categories/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());
        const existing = await prisma.category.findUnique({ where: { id: params.id } });
        if (!existing) return apiError(404, "Category not found");
        const category = await prisma.category.update({
          where: { id: params.id },
          data: {
            ...(body.data.name !== undefined ? { name: body.data.name } : {}),
            ...(body.data.blurb !== undefined ? { blurb: body.data.blurb } : {}),
            ...(body.data.image !== undefined ? { image: body.data.image } : {}),
          },
        });
        return json({ category });
      },
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;
        const existing = await prisma.category.findUnique({ where: { id: params.id } });
        if (!existing) return apiError(404, "Category not found");
        const count = await prisma.product.count({ where: { categoryId: params.id } });
        if (count > 0) return apiError(409, `Category has ${count} products — reassign them first`);
        await prisma.category.delete({ where: { id: params.id } });
        return json({ ok: true });
      },
    },
  },
});
