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
  console.log("🌱 Seeding database...");

  // Clean existing data (in reverse dependency order)
  await prisma.itemTag.deleteMany();
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: {
      id: "user_1",
      name: "John Doe",
      email: "john@example.com",
      emailVerified: new Date("2026-03-16"),
      isPro: false,
    },
  });

  console.log(`  ✓ Created user: ${user.name}`);

  // Create system item types
  const itemTypes = await Promise.all([
    prisma.itemType.create({
      data: { id: "type_snippet", name: "Snippet", icon: "code", color: "#6366f1", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_prompt", name: "Prompt", icon: "sparkles", color: "#8b5cf6", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_command", name: "Command", icon: "terminal", color: "#06b6d4", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_note", name: "Note", icon: "file-text", color: "#10b981", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_file", name: "File", icon: "paperclip", color: "#f59e0b", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_image", name: "Image", icon: "image", color: "#ec4899", isSystem: true },
    }),
    prisma.itemType.create({
      data: { id: "type_url", name: "URL", icon: "link", color: "#3b82f6", isSystem: true },
    }),
  ]);

  console.log(`  ✓ Created ${itemTypes.length} item types`);

  // Create collections
  const collections = await Promise.all([
    prisma.collection.create({
      data: {
        id: "col_1",
        name: "React Patterns",
        description: "Common React patterns and hooks",
        isFavorite: true,
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        id: "col_2",
        name: "Python Snippets",
        description: "Useful Python code snippets",
        isFavorite: false,
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        id: "col_3",
        name: "Context Files",
        description: "AI context files for projects",
        isFavorite: true,
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        id: "col_4",
        name: "Interview Prep",
        description: "Technical interview preparation",
        isFavorite: false,
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        id: "col_5",
        name: "Git Commands",
        description: "Frequently used git commands",
        isFavorite: true,
        userId: user.id,
      },
    }),
    prisma.collection.create({
      data: {
        id: "col_6",
        name: "AI Prompts",
        description: "Curated AI prompts for coding",
        isFavorite: false,
        userId: user.id,
      },
    }),
  ]);

  console.log(`  ✓ Created ${collections.length} collections`);

  // Create tags
  const tagNames = [
    "react", "auth", "hooks", "api", "error-handling", "typescript",
    "git", "undo", "ai", "explain", "code-review", "python", "list",
    "comprehension", "tailwind", "dark-mode", "next.js",
  ];

  const tags: Record<string, { id: string }> = {};
  for (const name of tagNames) {
    tags[name] = await prisma.tag.create({
      data: { name, userId: user.id },
    });
  }

  console.log(`  ✓ Created ${tagNames.length} tags`);

  // Create items with tags
  const itemsData = [
    {
      id: "item_1",
      title: "useAuth Hook",
      description: "Custom authentication hook for React applications",
      contentType: "text",
      content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthP')
  }
  return context
}`,
      language: "typescript",
      typeId: "type_snippet",
      collectionId: "col_1",
      isFavorite: true,
      isPinned: true,
      tagNames: ["react", "auth", "hooks"],
    },
    {
      id: "item_2",
      title: "API Error Handling Pattern",
      description: "Fetch wrapper with exponential backoff retry logic",
      contentType: "text",
      content: `async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      return await res.json()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 2 ** i * 1000))
    }
  }
}`,
      language: "typescript",
      typeId: "type_snippet",
      collectionId: "col_1",
      isFavorite: false,
      isPinned: true,
      tagNames: ["api", "error-handling", "typescript"],
    },
    {
      id: "item_3",
      title: "Git Undo Last Commit",
      description: "Undo last commit but keep changes staged",
      contentType: "text",
      content: "git reset --soft HEAD~1",
      language: "bash",
      typeId: "type_command",
      collectionId: "col_5",
      isFavorite: false,
      isPinned: false,
      tagNames: ["git", "undo"],
    },
    {
      id: "item_4",
      title: "Explain Code Prompt",
      description: "Prompt to get a clear explanation of any code block",
      contentType: "text",
      content:
        "Explain the following code in simple terms. Describe what it does, how it works, and any potential edge cases or issues:\n\n```\n{code}\n```",
      language: null,
      typeId: "type_prompt",
      collectionId: "col_6",
      isFavorite: true,
      isPinned: false,
      tagNames: ["ai", "explain", "code-review"],
    },
    {
      id: "item_5",
      title: "Python List Comprehension",
      description: "Common list comprehension patterns",
      contentType: "text",
      content: `# Filter and transform
evens_squared = [x**2 for x in range(20) if x % 2 == 0]

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]

# Dict comprehension
word_lengths = {word: len(word) for word in ['hello', 'world']}`,
      language: "python",
      typeId: "type_snippet",
      collectionId: "col_2",
      isFavorite: false,
      isPinned: false,
      tagNames: ["python", "list", "comprehension"],
    },
    {
      id: "item_6",
      title: "Tailwind Dark Mode Setup",
      description: "Quick setup note for Tailwind dark mode with Next.js",
      contentType: "text",
      content:
        "Use `next-themes` package with `ThemeProvider`. Wrap the app in `layout.tsx` and set `attribute='class'` so Tailwind's `dark:` variants work based on the `dark` class on `<html>`.",
      language: null,
      typeId: "type_note",
      collectionId: "col_1",
      isFavorite: false,
      isPinned: false,
      tagNames: ["tailwind", "dark-mode", "next.js"],
    },
  ];

  for (const item of itemsData) {
    const { tagNames: itemTagNames, ...itemData } = item;
    await prisma.item.create({
      data: {
        ...itemData,
        userId: user.id,
        tags: {
          create: itemTagNames.map((name) => ({
            tag: { connect: { id: tags[name].id } },
          })),
        },
      },
    });
  }

  console.log(`  ✓ Created ${itemsData.length} items with tags`);

  console.log("\n✅ Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
