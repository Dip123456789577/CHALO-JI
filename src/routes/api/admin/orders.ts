import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

const patchSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
    .optional(),
  note: z.string().max(300).optional(),
});

export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const orders = await prisma.order.findMany({
          where: status ? { status: status as never } : {},
          include: {
            items: { select: { quantity: true, name: true } },
            user: { select: { email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        return json({
          orders: orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            paymentStatus: o.paymentStatus,
            total: Number(o.total),
            email: o.email,
            customer: o.user?.name ?? null,
            itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
            createdAt: o.createdAt,
          })),
        });
      },
      PATCH: async ({ request }) => {
        const sessionUser = await getSessionUser(request);
        const auth = requireRole(sessionUser, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;
        const user = auth;

        const body = z
          .object({
            orderId: z.string().uuid(),
            status: z.enum([
              "PENDING",
              "CONFIRMED",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
              "REFUNDED",
            ]),
            note: z.string().max(300).optional(),
          })
          .safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload", body.error.flatten());

        const order = await prisma.order.findUnique({ where: { id: body.data.orderId } });
        if (!order) return apiError(404, "Order not found");

        const [updated] = await prisma.$transaction([
          prisma.order.update({ where: { id: order.id }, data: { status: body.data.status } }),
          prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: body.data.status,
              note: body.data.note ?? `Status → ${body.data.status}`,
            },
          }),
          prisma.adminActivityLog.create({
            data: {
              adminId: user.id,
              action: "order.status_update",
              entity: "Order",
              entityId: order.id,
              metadata: { from: order.status, to: body.data.status },
            },
          }),
        ]);
        return json({ order: updated });
      },
    },
  },
});
