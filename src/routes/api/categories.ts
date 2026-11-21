import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCategories } from "@/lib/server/catalog";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  blurb: z.string().max(300).optional(),
  image: z.string().url().optional(),
});

export const Route = createFileRoute("/api/categories")({
  server: {
    handlers: {
      GET: async () => {
        const categories = await getCategories();
        return json({
          categories: categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            blurb: c.blurb,
            image: c.image,
            productCount: c._count.products,
          })),
        });
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());
        try {
          const category = await prisma.category.create({
            data: {
              slug: body.data.slug,
              name: body.data.name,
              blurb: body.data.blurb ?? null,
              image: body.data.image ?? null,
            },
          });
          return json({ category }, { status: 201 });
        } catch {
          return apiError(409, "Category slug already exists");
        }
      },
    },
  },
});
