// AURELLE seed — populates Neon from the existing static catalog (src/lib/catalog.ts).
// Run: npm run db:seed   (requires DATABASE_URL in .env)
// All seeded products are demo catalogue entries.
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORIES, COLLECTIONS, PRODUCTS } from "../src/lib/catalog";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  console.log("Seeding categories…");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, blurb: c.blurb },
      update: { name: c.name, blurb: c.blurb },
    });
  }

  console.log("Seeding collections…");
  for (const c of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, description: c.description, image: c.image },
      update: { name: c.name, description: c.description, image: c.image },
    });
  }

  console.log(`Seeding ${PRODUCTS.length} products…`);
  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    if (!category) {
      console.warn(`  ! skipping ${p.handle}: unknown category ${p.category}`);
      continue;
    }
    const collectionSlug = p.collections[0];
    const collection = collectionSlug
      ? await prisma.collection.findUnique({ where: { slug: collectionSlug } })
      : null;

    const product = await prisma.product.upsert({
      where: { slug: p.handle },
      create: {
        slug: p.handle,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        material: p.material,
        color: p.color,
        categoryId: category.id,
        collectionId: collection?.id ?? null,
        stock: p.stock,
        published: true,
        featured: Boolean(p.isBestSeller),
        bestseller: Boolean(p.isBestSeller),
        isNew: Boolean(p.isNew),
        images: { create: p.images.map((url, i) => ({ url, position: i, alt: p.name })) },
        variants: { create: p.sizes.map((size) => ({ size, stock: p.stock })) },
        inventory: { create: { quantityOnHand: p.stock } },
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        material: p.material,
        color: p.color,
        stock: p.stock,
        bestseller: Boolean(p.isBestSeller),
        isNew: Boolean(p.isNew),
      },
    });

    // Keep images/variants in sync on re-seed.
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, i) => ({ productId: product.id, url, position: i, alt: p.name })),
    });
    for (const size of p.sizes) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: product.id, size } },
        create: { productId: product.id, size, stock: p.stock },
        update: {},
      });
    }
  }

  // Optional demo admin — only when SEED_ADMIN_PASSWORD is provided.
  const adminEmail = process.env["SEED_ADMIN_EMAIL"];
  const adminPassword = process.env["SEED_ADMIN_PASSWORD"];
  if (adminEmail && adminPassword) {
    const { hashPassword } = await import("../src/lib/server/auth");
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      create: {
        email: adminEmail.toLowerCase(),
        name: "Store Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        emailVerifiedAt: new Date(),
      },
      update: { role: "SUPER_ADMIN", passwordHash },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
