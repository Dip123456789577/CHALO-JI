import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/server/auth";
import { apiError, json, readJson } from "@/lib/server/http";

export const Route = createFileRoute("/api/products/$productId/reviews")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const reviews = await prisma.review.findMany({
          where: { productId: params.productId },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        const agg = await prisma.review.aggregate({
          where: { productId: params.productId },
          _avg: { rating: true },
          _count: true,
        });
        return json({
          reviews: reviews.map((r) => ({
            id: r.id,
            author: r.authorName,
            rating: r.rating,
            title: r.title,
            body: r.body,
            verified: r.verified,
            createdAt: r.createdAt,
          })),
          rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
          count: agg._count,
        });
      },
      POST: async ({ request, params }) => {
        const user = await getSessionUser(request);
        if (!user) return apiError(401, "Sign in to write a review");
        const body = z
          .object({
            rating: z.number().int().min(1).max(5),
            title: z.string().max(120).optional(),
            body: z.string().min(10).max(2000),
          })
          .safeParse(await readJson(request));
        if (!body.success) return apiError(400, "Invalid review", body.error.flatten());

        const product = await prisma.product.findUnique({ where: { id: params.productId } });
        if (!product) return apiError(404, "Product not found");

        // Only verified buyers can mark a review verified.
        const purchase = await prisma.orderItem.findFirst({
          where: {
            productId: product.id,
            order: { userId: user.id, paymentStatus: "PAID" },
          },
        });

        const review = await prisma.review.create({
          data: {
            productId: product.id,
            userId: user.id,
            authorName: user.name,
            rating: body.data.rating,
            title: body.data.title ?? null,
            body: body.data.body,
            verified: Boolean(purchase),
          },
        });
        return json({ review }, { status: 201 });
      },
    },
  },
});
