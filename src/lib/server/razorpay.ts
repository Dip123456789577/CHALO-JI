// Server-only Razorpay helpers. Credentials come from env — never exposed to the client.
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

const RAZORPAY_API = "https://api.razorpay.com/v1";

export function razorpayConfigured(): boolean {
  return Boolean(process.env["RAZORPAY_KEY_ID"] && process.env["RAZORPAY_KEY_SECRET"]);
}

function authHeader(): string {
  const id = process.env["RAZORPAY_KEY_ID"]!;
  const secret = process.env["RAZORPAY_KEY_SECRET"]!;
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function createRazorpayOrder(params: {
  amountInr: number;
  receipt: string;
}): Promise<{ id: string; amount: number; currency: string } | null> {
  if (!razorpayConfigured()) return null;
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: authHeader() },
    body: JSON.stringify({
      amount: Math.round(params.amountInr * 100), // paise
      currency: "INR",
      receipt: params.receipt,
    }),
  });
  if (!res.ok) {
    console.error("[razorpay] order create failed", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return data;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

// Idempotent payment capture — safe to call from verify endpoint and webhook.
export async function markPaymentPaid(params: {
  providerOrderId: string;
  providerPaymentId: string;
  method?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { provider: "RAZORPAY", providerOrderId: params.providerOrderId },
      include: { order: true },
    });
    if (!payment) return { ok: false as const, reason: "unknown_order" };
    if (payment.status === "PAID") return { ok: true as const, alreadyPaid: true };

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId: params.providerPaymentId,
        method: params.method ?? null,
        signatureVerified: true,
      },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: payment.orderId, status: "CONFIRMED", note: "Payment verified" },
    });
    return { ok: true as const, orderId: payment.orderId };
  });
}
