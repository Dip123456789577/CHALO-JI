import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Singleton Prisma client — survives Vite dev-server hot reloads via globalThis.
// Connects to Neon through the pooled DATABASE_URL (serverless driver adapter).
// Migrations use DIRECT_URL via prisma.config.ts — never expose either to the client bundle.
// Lazy-initialized: importing this module never throws; the first query does,
// so API routes can return a clean error when DATABASE_URL is not configured.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon pooled connection string to .env — see .env.example.",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
