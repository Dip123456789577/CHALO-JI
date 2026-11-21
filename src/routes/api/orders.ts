import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { resolveCart } from "@/lib/server/cart";
import { apiError, json, readJson } from "@/lib/server/http";

export const FREE_SHIPPING_THRESHOLD = 1999;
export const FLAT_SHIPPING = 99;

const addressSchema = z.object({
  fullName: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  pincode: z.string().regex(/^[0-9]{6}$/),
  country: z.string().max(60).default("India"),
});

const orderSchema = z.object({
  email: z.string().email().optional(),
  address: addressSchema,
  addressId: z.string().uuid().optional(),
  couponCode: z.string().max(40).optional(),
  paymentMethod: z.enum(["razorpay", "cod", "demo"]).default("razorpay"),
});

export const Route = createFileRoute("/api/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Unauthorized");
        const orders = await prisma.order.findMany({
          where: { userId: user.id },
          include: { items: true, payments: { select: { status: true, provider: true } } },
          orderBy: { createdAt: "desc" },
        });
        return json({
          orders: orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            paymentStatus: o.paymentStatus,
            total: Number(o.total),
            currency: o.currency,
            itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
            createdAt: o.createdAt,
          })),
        });
      },
      POST: async ({ request }) => {
        const resolved = await resolveCart(request);
        const body = orderSchema.safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid order payload", body.error.flatten());
        const d = body.data;

        const cart = await prisma.cart.findUnique({
          where: { id: resolved.cartId },
          include: {
            items: { include: { product: true, variant: true } },
          },
        });
        if (!cart || cart.items.length === 0) return apiError(400, "Your cart is empty");

        // ── Server-side pricing — never trust client amounts ──
        let subtotal = 0;
        for (const item of cart.items) {
          if (!item.product.published)
            return apiError(409, `"${item.product.name}" is no longer available`);
          const stock = item.variant ? item.variant.stock : item.product.stock;
          if (item.quantity > stock) {
            return apiError(409, `Insufficient stock for "${item.product.name}"`);
          }
          subtotal += Number(item.product.price) * item.quantity;
        }

        // Coupon validation
        let discount = 0;
        if (d.couponCode) {
          const coupon = await prisma.coupon.findUnique({
            where: { code: d.couponCode.toUpperCase() },
          });
          const now = new Date();
          const valid =
            coupon &&
            coupon.active &&
            (!coupon.expiresAt || coupon.expiresAt > now) &&
            (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
            (coupon.minOrderValue === null || subtotal >= Number(coupon.minOrderValue));
          if (!valid) return apiError(400, "Invalid or expired coupon");
          discount =
            coupon.type === "PERCENT"
              ? Math.round((subtotal * Number(coupon.value)) / 100)
              : Math.min(Number(coupon.value), subtotal);
        }

        const shipping =
          subtotal - discount >= FREE_SHIPPING_THRESHOLD || subtotal - discount === 0
            ? 0
            : FLAT_SHIPPING;
        const total = subtotal - discount + shipping;
        const email = d.email ?? resolved.user?.email;
        if (!email) return apiError(400, "Email is required for guest checkout");

        const orderNumber = `AUR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

        const order = await prisma
          .$transaction(async (tx) => {
            // Atomic stock decrement — fails the whole transaction on oversell.
            for (const item of cart.items) {
              if (item.variant) {
                const res = await tx.productVariant.updateMany({
                  where: { id: item.variant.id, stock: { gte: item.quantity } },
                  data: { stock: { decrement: item.quantity } },
                });
                if (res.count === 0) throw new Error(`STOCK:${item.product.name}`);
              } else {
                const res = await tx.product.updateMany({
                  where: { id: item.product.id, stock: { gte: item.quantity } },
                  data: { stock: { decrement: item.quantity } },
                });
                if (res.count === 0) throw new Error(`STOCK:${item.product.name}`);
              }
            }

            const created = await tx.order.create({
              data: {
                orderNumber,
                userId: resolved.user?.id ?? null,
                addressId: d.addressId ?? null,
                email,
                status: "PENDING",
                paymentStatus: d.paymentMethod === "cod" ? "PENDING" : "CREATED",
                subtotal,
                shipping,
                discount,
                total,
                currency: "INR",
                couponCode: d.couponCode?.toUpperCase() ?? null,
                shipFullName: d.address.fullName,
                shipPhone: d.address.phone,
                shipLine1: d.address.line1,
                shipLine2: d.address.line2 ?? null,
                shipCity: d.address.city,
                shipState: d.address.state,
                shipPincode: d.address.pincode,
                shipCountry: d.address.country,
                items: {
                  create: cart.items.map((i) => ({
                    productId: i.product.id,
                    variantId: i.variant?.id ?? null,
                    name: i.product.name,
                    sku: i.variant?.sku ?? i.product.sku,
                    size: i.variant?.size ?? null,
                    quantity: i.quantity,
                    unitPrice: i.product.price,
                    totalPrice: i.product.price.mul(i.quantity),
                  })),
                },
                payments: {
                  create: {
                    provider:
                      d.paymentMethod === "razorpay"
                        ? "RAZORPAY"
                        : d.paymentMethod === "cod"
                          ? "COD"
                          : "DEMO",
                    amount: total,
                    currency: "INR",
                    status: "CREATED",
                  },
                },
                statusHistory: { create: { status: "PENDING", note: "Order placed" } },
              },
              include: { items: true, payments: true },
            });

            if (d.couponCode) {
              await tx.coupon.updateMany({
                where: { code: d.couponCode.toUpperCase() },
                data: { usedCount: { increment: 1 } },
              });
            }

            // Clear the cart.
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return created;
          })
          .catch((e) => {
            const msg = String(e);
            if (msg.includes("STOCK:")) {
              return { stockError: msg.split("STOCK:")[1] } as const;
            }
            throw e;
          });

        if ("stockError" in order) {
          return apiError(409, `Insufficient stock for "${order.stockError}"`);
        }

        return json(
          {
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
              items: order.items.map((i) => ({
                id: i.id,
                name: i.name,
                size: i.size,
                quantity: i.quantity,
                unitPrice: Number(i.unitPrice),
                totalPrice: Number(i.totalPrice),
              })),
            },
          },
          { status: 201 },
        );
      },
    },
  },
});
