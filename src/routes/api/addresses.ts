import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  label: z.string().max(40).default("Home"),
  fullName: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  pincode: z.string().regex(/^[0-9]{6}$/, "Indian pincode must be 6 digits"),
  country: z.string().max(60).default("India"),
  isDefault: z.boolean().default(false),
});

export const Route = createFileRoute("/api/addresses")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const addresses = await prisma.address.findMany({
          where: { userId: user.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        return json({ addresses });
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid address", body.error.flatten());
        const d = body.data;

        const address = await prisma.$transaction(async (tx) => {
          if (d.isDefault) {
            await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
          }
          return tx.address.create({
            data: {
              userId: user.id,
              label: d.label,
              fullName: d.fullName,
              phone: d.phone,
              line1: d.line1,
              line2: d.line2 ?? null,
              city: d.city,
              state: d.state,
              pincode: d.pincode,
              country: d.country,
              isDefault: d.isDefault,
            },
          });
        });
        return json({ address }, { status: 201 });
      },
    },
  },
});
