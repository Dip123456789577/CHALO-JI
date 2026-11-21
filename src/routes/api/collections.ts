import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/lib/db/prisma";
import { getCollections } from "@/lib/server/catalog";
import { json } from "@/lib/server/http";

export const Route = createFileRoute("/api/collections")({
  server: {
    handlers: {
      GET: async () => {
        const collections = await getCollections();
        return json({
          collections: collections.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
            image: c.image,
            productCount: c._count.products,
          })),
        });
      },
    },
  },
});
