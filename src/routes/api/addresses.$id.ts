import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
  line1: z.string().min(1).max(200).optional(),
  line2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(80).optional(),
  state: z.string().min(1).max(80).optional(),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/)
    .optional(),
  country: z.string().max(60).optional(),
  isDefault: z.boolean().optional(),
});

export const Route = createFileRoute("/api/addresses/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());

        const existing = await prisma.address.findFirst({
          where: { id: params.id, userId: user.id },
        });
        if (!existing) return apiError(404, "Address not found");

        const d = body.data;
        const address = await prisma.$transaction(async (tx) => {
          if (d.isDefault) {
            await tx.address.updateMany({
              where: { userId: user.id, NOT: { id: params.id } },
              data: { isDefault: false },
            });
          }
          return tx.address.update({
            where: { id: params.id },
            data: {
              ...(d.label !== undefined ? { label: d.label } : {}),
              ...(d.fullName !== undefined ? { fullName: d.fullName } : {}),
              ...(d.phone !== undefined ? { phone: d.phone } : {}),
              ...(d.line1 !== undefined ? { line1: d.line1 } : {}),
              ...(d.line2 !== undefined ? { line2: d.line2 } : {}),
              ...(d.city !== undefined ? { city: d.city } : {}),
              ...(d.state !== undefined ? { state: d.state } : {}),
              ...(d.pincode !== undefined ? { pincode: d.pincode } : {}),
              ...(d.country !== undefined ? { country: d.country } : {}),
              ...(d.isDefault !== undefined ? { isDefault: d.isDefault } : {}),
            },
          });
        });
        return json({ address });
      },
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const existing = await prisma.address.findFirst({
          where: { id: params.id, userId: user.id },
        });
        if (!existing) return apiError(404, "Address not found");
        await prisma.address.delete({ where: { id: params.id } });
        return json({ ok: true });
      },
    },
  },
});
