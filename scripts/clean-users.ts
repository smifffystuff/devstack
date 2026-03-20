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

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No users to delete. Only the demo user exists.");
    return;
  }

  console.log(`Found ${usersToDelete.length} user(s) to delete:\n`);
  for (const user of usersToDelete) {
    console.log(`  - ${user.email} (${user.id})`);
  }

  const userIds = usersToDelete.map((u) => u.id);

  // Delete in order respecting foreign keys
  // ItemTags are cascade-deleted via Items, but delete explicitly for clarity
  const itemTags = await prisma.itemTag.deleteMany({
    where: { item: { userId: { in: userIds } } },
  });
  console.log(`\nDeleted ${itemTags.count} item-tag links`);

  const items = await prisma.item.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${items.count} items`);

  const collections = await prisma.collection.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${collections.count} collections`);

  const tags = await prisma.tag.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${tags.count} tags`);

  const itemTypes = await prisma.itemType.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${itemTypes.count} custom item types`);

  const accounts = await prisma.account.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${accounts.count} accounts`);

  const sessions = await prisma.session.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log(`Deleted ${sessions.count} sessions`);

  const users = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`Deleted ${users.count} users`);

  console.log("\nDone. Only demo@devstash.io remains.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
