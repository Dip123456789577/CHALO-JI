import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return json({ user: null }, { status: 401 });
        return json({ user });
      },
    },
  },
});
