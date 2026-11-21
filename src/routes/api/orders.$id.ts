import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { apiError, json } from "@/lib/server/http";

export const Route = createFileRoute("/api/orders/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await getSessionUser(request);
        const isAdmin = user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
        if (!user && !isAdmin) return apiError(401, "Unauthorized");

        const order = await prisma.order.findUnique({
          where: { id: params.id },
          include: {
            items: true,
            payments: {
              select: {
                id: true,
                provider: true,
                status: true,
                amount: true,
                currency: true,
                createdAt: true,
              },
            },
            shipments: true,
            statusHistory: { orderBy: { createdAt: "asc" } },
          },
        });
        if (!order) return apiError(404, "Order not found");
        if (!isAdmin && order.userId !== user!.id && order.email !== user!.email) {
          return apiError(403, "Forbidden");
        }

        return json({
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            subtotal: Number(order.subtotal),
            shipping: Number(order.shipping),
            discount: Number(order.discount),
            total: Number(order.total),
            currency: order.currency,
            couponCode: order.couponCode,
            email: order.email,
            createdAt: order.createdAt,
            shipFullName: order.shipFullName,
            shipPhone: order.shipPhone,
            shipLine1: order.shipLine1,
            shipLine2: order.shipLine2,
            shipCity: order.shipCity,
            shipState: order.shipState,
            shipPincode: order.shipPincode,
            shipCountry: order.shipCountry,
            items: order.items.map((i) => ({
              id: i.id,
              name: i.name,
              sku: i.sku,
              size: i.size,
              quantity: i.quantity,
              unitPrice: Number(i.unitPrice),
              totalPrice: Number(i.totalPrice),
            })),
            payments: order.payments,
            shipments: order.shipments.map((s) => ({
              id: s.id,
              provider: s.provider,
              trackingNumber: s.trackingNumber,
              status: s.status,
              shippedAt: s.shippedAt,
              deliveredAt: s.deliveredAt,
            })),
            statusHistory: order.statusHistory,
          },
        });
      },
    },
  },
});
