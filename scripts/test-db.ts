import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Testing database connection...\n");

  // Test connection
  const result = await prisma.$queryRawUnsafe<{ now: Date }[]>("SELECT NOW()");
  console.log(`  ✓ Connected at ${result[0].now}\n`);

  // Count all records
  const [users, items, itemTypes, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.itemType.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("📊 Record counts:");
  console.log(`  Users:       ${users}`);
  console.log(`  Items:       ${items}`);
  console.log(`  Item Types:  ${itemTypes}`);
  console.log(`  Collections: ${collections}`);
  console.log(`  Tags:        ${tags}`);

  // Fetch a sample item with relations
  const sampleItem = await prisma.item.findFirst({
    include: {
      type: true,
      collection: true,
      tags: { include: { tag: true } },
    },
  });

  if (sampleItem) {
    console.log(`\n📝 Sample item:`);
    console.log(`  Title:      ${sampleItem.title}`);
    console.log(`  Type:       ${sampleItem.type.name}`);
    console.log(`  Collection: ${sampleItem.collection?.name ?? "None"}`);
    console.log(`  Tags:       ${sampleItem.tags.map((t) => t.tag.name).join(", ")}`);
  }

  console.log("\n✅ Database test passed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Database test failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
