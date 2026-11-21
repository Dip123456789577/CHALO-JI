import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { consumeVerificationToken, hashPassword } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export const Route = createFileRoute("/api/auth/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());

        // Token identifier is reset:<email>; the client sends token + email.
        const email = new URL(request.url).searchParams.get("email")?.toLowerCase();
        if (!email) return apiError(400, "Email is required");

        const record = await consumeVerificationToken(`reset:${email}`, body.data.token);
        if (!record) return apiError(400, "Invalid or expired reset token");

        const passwordHash = await hashPassword(body.data.password);
        await prisma.user.update({ where: { email }, data: { passwordHash } });
        // Invalidate all existing sessions after a password reset.
        await prisma.session.deleteMany({ where: { user: { email } } });
        return json({ ok: true });
      },
    },
  },
});
