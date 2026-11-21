// Server-only cart resolution: authenticated users get a persistent cart,
// guests get one keyed by an httpOnly session cookie.
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, type AuthUser } from "@/lib/server/auth";
import { getCookies, setCookie } from "@/lib/server/http";

export const CART_COOKIE = "aurelle_cart";

export interface ResolvedCart {
  cartId: string;
  user: AuthUser | null;
  guestToken: string | null;
  setCookieHeader?: string | undefined;
}

export async function resolveCart(request: Request): Promise<ResolvedCart> {
  const user = await getSessionUser(request);
  if (user) {
    let cart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }
    return { cartId: cart.id, user, guestToken: null };
  }

  const cookies = getCookies(request);
  let token = cookies[CART_COOKIE];
  let setCookieHeader: string | undefined;
  if (!token) {
    token = randomBytes(24).toString("hex");
    setCookieHeader = setCookie(CART_COOKIE, token, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "Lax",
    });
  }
  let cart = await prisma.cart.findFirst({ where: { sessionToken: token } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { sessionToken: token } });
  }
  return { cartId: cart.id, user: null, guestToken: token, setCookieHeader };
}

export async function cartWithItems(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              variants: true,
            },
          },
          variant: true,
        },
      },
    },
  });
  if (!cart) return null;

  const items = cart.items.map((i) => ({
    id: i.id,
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
    name: i.product.name,
    slug: i.product.slug,
    price: Number(i.product.price),
    image: i.product.images[0]?.url ?? null,
    size: i.variant?.size ?? null,
    stock: i.variant ? i.variant.stock : i.product.stock,
    lineTotal: Number(i.product.price) * i.quantity,
  }));

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return {
    id: cart.id,
    items,
    subtotal,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    couponCode: cart.couponCode,
  };
}
