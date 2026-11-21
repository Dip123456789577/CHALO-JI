import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { consumeVerificationToken } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({ token: z.string().min(10) });

export const Route = createFileRoute("/api/auth/verify-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload");
        const email = new URL(request.url).searchParams.get("email")?.toLowerCase();
        if (!email) return apiError(400, "Email is required");

        const record = await consumeVerificationToken(`verify:${email}`, body.data.token);
        if (!record) return apiError(400, "Invalid or expired verification token");

        await prisma.user.update({
          where: { email },
          data: { emailVerifiedAt: new Date() },
        });
        return json({ ok: true });
      },
    },
  },
});
