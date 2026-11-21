import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/admin/customers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;

        const customers = await prisma.user.findMany({
          where: { role: "CUSTOMER" },
          select: {
            id: true,
            email: true,
            name: true,
            emailVerifiedAt: true,
            createdAt: true,
            _count: { select: { orders: true, addresses: true, reviews: true } },
            orders: { select: { total: true, paymentStatus: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        });

        return json({
          customers: customers.map((c) => ({
            id: c.id,
            email: c.email,
            name: c.name,
            verified: Boolean(c.emailVerifiedAt),
            joinedAt: c.createdAt,
            orderCount: c._count.orders,
            addressCount: c._count.addresses,
            reviewCount: c._count.reviews,
            totalSpent: c.orders
              .filter((o) => o.paymentStatus === "PAID")
              .reduce((s, o) => s + Number(o.total), 0),
          })),
        });
      },
    },
  },
});
