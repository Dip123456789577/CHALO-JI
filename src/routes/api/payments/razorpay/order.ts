import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/server/razorpay";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({ orderId: z.string().uuid() });

export const Route = createFileRoute("/api/payments/razorpay/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        if (!razorpayConfigured()) return apiError(503, "Razorpay is not configured");

        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload");

        const order = await prisma.order.findUnique({
          where: { id: body.data.orderId },
          include: { payments: true },
        });
        if (!order || order.userId !== user.id) return apiError(404, "Order not found");
        if (order.paymentStatus === "PAID") return apiError(409, "Order already paid");

        const payment = order.payments.find((p) => p.provider === "RAZORPAY") ?? order.payments[0];
        if (!payment) return apiError(404, "No payment record");

        const rzOrder = await createRazorpayOrder({
          amountInr: Number(order.total),
          receipt: order.orderNumber,
        });
        if (!rzOrder) return apiError(502, "Could not create Razorpay order");

        await prisma.payment.update({
          where: { id: payment.id },
          data: { providerOrderId: rzOrder.id, status: "PENDING" },
        });

        return json({
          razorpayOrderId: rzOrder.id,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          keyId: process.env["RAZORPAY_KEY_ID"],
          orderId: order.id,
        });
      },
    },
  },
});
