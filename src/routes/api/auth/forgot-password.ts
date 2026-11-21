import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createVerificationToken } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({ email: z.string().email() });

export const Route = createFileRoute("/api/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload");
        const email = body.data.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({ where: { email } });
        // Always return success to avoid account enumeration.
        if (user) {
          const token = await createVerificationToken(`reset:${email}`, 1000 * 60 * 30);
          console.log(`[auth] password reset token for ${email}: ${token}`);
        }
        return json({ ok: true });
      },
    },
  },
});
