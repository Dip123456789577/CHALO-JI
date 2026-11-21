import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json } from "@/lib/server/http";

export const Route = createFileRoute("/api/wishlist/$id")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
        if (!wishlist) return apiError(404, "Wishlist is empty");
        const item = await prisma.wishlistItem.findFirst({
          where: { id: params.id, wishlistId: wishlist.id },
        });
        if (!item) return apiError(404, "Item not found");
        await prisma.wishlistItem.delete({ where: { id: item.id } });
        return json({ ok: true });
      },
    },
  },
});
