import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const [orders, revenue, customers, products, lowStock, recentOrders] = await Promise.all([
          prisma.order.count(),
          prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
          prisma.user.count({ where: { role: "CUSTOMER" } }),
          prisma.product.count({ where: { published: true } }),
          prisma.product.count({ where: { stock: { lte: 5 }, published: true } }),
          prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { items: { select: { quantity: true } } },
          }),
        ]);

        const itemsSold = await prisma.orderItem.aggregate({
          _sum: { quantity: true },
          where: { order: { paymentStatus: "PAID" } },
        });

        return json({
          stats: {
            orders,
            revenue: Number(revenue._sum.total ?? 0),
            customers,
            products,
            lowStock,
            itemsSold: itemsSold._sum.quantity ?? 0,
          },
          recentOrders: recentOrders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            paymentStatus: o.paymentStatus,
            total: Number(o.total),
            email: o.email,
            itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
            createdAt: o.createdAt,
          })),
        });
      },
    },
  },
});
