import { createFileRoute } from "@tanstack/react-router";
import { resolveCart, cartWithItems } from "@/lib/server/cart";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/cart")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const resolved = await resolveCart(request);
        const cart = await cartWithItems(resolved.cartId);
        const headers: Record<string, string> = {};
        if (resolved.setCookieHeader) headers["set-cookie"] = resolved.setCookieHeader;
        return json({ cart }, { headers });
      },
    },
  },
});
