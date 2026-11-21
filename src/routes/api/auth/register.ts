import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, createSession, createVerificationToken } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(120),
});

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = schema.safeParse(await readJson(request));
        if (!body.success)
          return apiError(400, "Invalid registration payload", body.error.flatten());
        const { email, password, name } = body.data;
        const normalized = email.trim().toLowerCase();

        const existing = await prisma.user.findUnique({ where: { email: normalized } });
        if (existing) return apiError(409, "An account with this email already exists");

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
          data: { email: normalized, passwordHash, name: name.trim() },
        });

        // Email verification token — delivery is a no-op until SMTP is configured.
        const token = await createVerificationToken(`verify:${normalized}`, 1000 * 60 * 60 * 24);
        console.log(`[auth] verification token for ${normalized}: ${token}`);

        const { setCookie } = await createSession(user.id);
        return json(
          { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
          { status: 201, headers: { "set-cookie": setCookie } },
        );
      },
    },
  },
});
