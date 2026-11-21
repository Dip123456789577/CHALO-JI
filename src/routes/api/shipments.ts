import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/server/auth";
import { createShiprocketShipment, shiprocketConfigured } from "@/lib/server/shiprocket";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({ orderId: z.string().uuid() });

export const Route = createFileRoute("/api/shipments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        const auth = requireRole(user, ["ADMIN", "SUPER_ADMIN"]);
        if (auth instanceof Response) return auth;
        if (!shiprocketConfigured()) return apiError(503, "Shiprocket is not configured");

        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload");

        const order = await prisma.order.findUnique({ where: { id: body.data.orderId } });
        if (!order) return apiError(404, "Order not found");
        if (order.paymentStatus !== "PAID" && order.status === "PENDING") {
          return apiError(409, "Order is not paid yet");
        }

        const result = await createShiprocketShipment(order.id);
        if (!result.ok) return apiError(502, `Shipment creation failed: ${result.reason}`);

        const shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            provider: "shiprocket",
            trackingNumber: result.awbCode ?? null,
            status: "PENDING",
            rawPayload: result.raw as object,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PROCESSING" },
        });
        await prisma.orderStatusHistory.create({
          data: { orderId: order.id, status: "PROCESSING", note: "Shipment created" },
        });

        return json({ shipment }, { status: 201 });
      },
    },
  },
});
