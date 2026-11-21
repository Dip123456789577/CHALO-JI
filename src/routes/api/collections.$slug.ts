import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { queryProducts } from "@/lib/server/catalog";
import { apiError, json } from "@/lib/server/http";

export const Route = createFileRoute("/api/collections/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const collection = await prisma.collection.findUnique({ where: { slug: params.slug } });
        if (!collection) return apiError(404, "Collection not found");
        const url = new URL(request.url);
        const num = (k: string) => {
          const v = url.searchParams.get(k);
          return v !== null ? Number(v) : undefined;
        };
        const result = await queryProducts({
          collection: params.slug,
          page: num("page"),
          limit: num("limit"),
          sort: (url.searchParams.get("sort") as never) ?? undefined,
        });
        return json({
          collection: {
            id: collection.id,
            slug: collection.slug,
            name: collection.name,
            description: collection.description,
            image: collection.image,
          },
          ...result,
        });
      },
    },
  },
});
