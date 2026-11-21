import { createFileRoute } from "@tanstack/react-router";
import { destroySession } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const setCookie = await destroySession(request);
        return json({ ok: true }, { headers: { "set-cookie": setCookie } });
      },
    },
  },
});
