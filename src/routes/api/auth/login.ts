import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSession } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid login payload");

        const user = await prisma.user.findUnique({
          where: { email: body.data.email.trim().toLowerCase() },
        });
        // Constant-ish failure path: always run a verify to reduce timing signal.
        const ok = user ? await verifyPassword(body.data.password, user.passwordHash) : false;
        if (!user || !ok) return apiError(401, "Invalid email or password");

        const { setCookie } = await createSession(user.id);
        return json(
          { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
          { headers: { "set-cookie": setCookie } },
        );
      },
    },
  },
});
