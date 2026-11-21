import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

export const Route = createFileRoute("/api/profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const full = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerifiedAt: true,
            createdAt: true,
            addresses: { orderBy: { isDefault: "desc" } },
          },
        });
        return json({ user: full });
      },
      PATCH: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const body = patchSchema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());
        if (body.data.name === undefined) return apiError(400, "Nothing to update");
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { name: body.data.name },
          select: { id: true, email: true, name: true, role: true },
        });
        return json({ user: updated });
      },
    },
  },
});
