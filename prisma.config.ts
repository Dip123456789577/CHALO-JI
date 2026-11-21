import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // CLI commands (migrate/introspect) use the direct Neon connection.
  // The runtime app connects via the pooled DATABASE_URL through the
  // Neon driver adapter in src/lib/db/prisma.ts.
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
