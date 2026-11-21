import { createFileRoute } from "@tanstack/react-router";
import { markPaymentPaid, verifyWebhookSignature } from "@/lib/server/razorpay";
import { apiError, json } from "@/lib/server/http";

// Razorpay webhook — signature verified against RAZORPAY_WEBHOOK_SECRET.
// Idempotent: markPaymentPaid no-ops if the payment is already PAID.
export const Route = createFileRoute("/api/payments/razorpay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        if (!verifyWebhookSignature(rawBody, signature)) {
          return apiError(401, "Invalid webhook signature");
        }

        let event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return apiError(400, "Invalid JSON");
        }

        if (event.event === "payment.captured" || event.event === "order.paid") {
          const entity = event.payload?.payment?.entity;
          const orderId = entity?.["order_id"] as string | undefined;
          const paymentId = entity?.["id"] as string | undefined;
          const method = entity?.["method"] as string | undefined;
          if (orderId && paymentId) {
            await markPaymentPaid({
              providerOrderId: orderId,
              providerPaymentId: paymentId,
              ...(method ? { method } : {}),
            });
          }
        }
        return json({ ok: true });
      },
    },
  },
});
