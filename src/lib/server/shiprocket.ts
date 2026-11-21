// Server-only Shiprocket integration. Credentials stay server-side.
import { prisma } from "@/lib/db/prisma";

const SHIPROCKET_API = "https://apiv2.shiprocket.in/v1/external";

export function shiprocketConfigured(): boolean {
  return Boolean(process.env["SHIPROCKET_EMAIL"] && process.env["SHIPROCKET_PASSWORD"]);
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  const res = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: process.env["SHIPROCKET_EMAIL"],
      password: process.env["SHIPROCKET_PASSWORD"],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  if (!data.token) return null;
  tokenCache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 3600 * 1000 };
  return data.token;
}

export async function createShiprocketShipment(orderId: string) {
  if (!shiprocketConfigured()) return { ok: false as const, reason: "not_configured" as const };
  const token = await getToken();
  if (!token) return { ok: false as const, reason: "auth_failed" as const };

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false as const, reason: "order_not_found" as const };

  const res = await fetch(`${SHIPROCKET_API}/orders/create/adhoc`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().slice(0, 10),
      pickup_location: "Primary",
      billing_customer_name: order.shipFullName,
      billing_last_name: "",
      billing_address: order.shipLine1,
      billing_city: order.shipCity,
      billing_pincode: order.shipPincode,
      billing_state: order.shipState,
      billing_country: order.shipCountry,
      billing_email: order.email,
      billing_phone: order.shipPhone,
      shipping_is_billing: true,
      order_items: order.items.map((i) => ({
        name: i.name,
        sku: i.sku ?? i.id,
        units: i.quantity,
        selling_price: Number(i.unitPrice),
      })),
      payment_method: "Prepaid",
      sub_total: Number(order.subtotal),
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    }),
  });
  if (!res.ok) {
    console.error("[shiprocket] create failed", res.status, await res.text());
    return { ok: false as const, reason: "api_error" as const };
  }
  const data = (await res.json()) as { shipment_id?: number; awb_code?: string; status?: boolean };
  return { ok: true as const, shipmentId: data.shipment_id, awbCode: data.awb_code, raw: data };
}
