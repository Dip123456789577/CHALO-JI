import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getSessionUser } from "@/lib/server/auth";
import { markPaymentPaid, verifyRazorpaySignature } from "@/lib/server/razorpay";
import { apiError, json, readJson } from "@/lib/server/http";

const schema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const Route = createFileRoute("/api/payments/razorpay/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");

        const body = schema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid payload");

        // Signature verification is mandatory — never trust client claims.
        const valid = verifyRazorpaySignature({
          orderId: body.data.razorpayOrderId,
          paymentId: body.data.razorpayPaymentId,
          signature: body.data.razorpaySignature,
        });
        if (!valid) return apiError(400, "Payment signature verification failed");

        const result = await markPaymentPaid({
          providerOrderId: body.data.razorpayOrderId,
          providerPaymentId: body.data.razorpayPaymentId,
        });
        if (!result.ok) return apiError(404, "Payment record not found");
        return json({ ok: true, orderId: result.orderId ?? null });
      },
    },
  },
});
