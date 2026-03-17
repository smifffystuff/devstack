import "dotenv/config";
import { hash } from "bcryptjs";
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
  const hashedPassword = await hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@devstash.io",
      emailVerified: new Date(),
      password: hashedPassword,
      isPro: false,
    },
  });

  console.log(`  ✓ Created user: ${user.name}`);

  // Create system item types
  const typeData = [
    { name: "snippet", icon: "Code", color: "#3b82f6" },
    { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
    { name: "command", icon: "Terminal", color: "#f97316" },
    { name: "note", icon: "StickyNote", color: "#fde047" },
    { name: "file", icon: "File", color: "#6b7280" },
    { name: "image", icon: "Image", color: "#ec4899" },
    { name: "link", icon: "Link", color: "#10b981" },
  ] as const;

  const types: Record<string, string> = {};
  for (const t of typeData) {
    const created = await prisma.itemType.create({
      data: { name: t.name, icon: t.icon, color: t.color, isSystem: true },
    });
    types[t.name] = created.id;
  }

  console.log(`  ✓ Created ${typeData.length} item types`);

  // Create collections
  const collectionsData = [
    { name: "React Patterns", description: "Reusable React patterns and hooks" },
    { name: "AI Workflows", description: "AI prompts and workflow automations" },
    { name: "DevOps", description: "Infrastructure and deployment resources" },
    { name: "Terminal Commands", description: "Useful shell commands for everyday development" },
    { name: "Design Resources", description: "UI/UX resources and references" },
  ];

  const collections: Record<string, string> = {};
  for (const c of collectionsData) {
    const created = await prisma.collection.create({
      data: { ...c, userId: user.id },
    });
    collections[c.name] = created.id;
  }

  console.log(`  ✓ Created ${collectionsData.length} collections`);

  // Create tags
  const tagNames = [
    "react", "hooks", "typescript", "state", "context",
    "ai", "code-review", "documentation", "refactoring",
    "docker", "ci-cd", "deployment", "kubernetes",
    "git", "shell", "npm", "process",
    "css", "tailwind", "design", "ui", "icons",
  ];

  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const created = await prisma.tag.create({
      data: { name, userId: user.id },
    });
    tags[name] = created.id;
  }

  console.log(`  ✓ Created ${tagNames.length} tags`);

  // Helper to create an item with tags
  async function createItem(data: {
    title: string;
    description: string;
    contentType: string;
    content?: string;
    url?: string;
    language?: string;
    typeId: string;
    collectionId: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    tagNames: string[];
  }) {
    const { tagNames: itemTags, ...itemData } = data;
    await prisma.item.create({
      data: {
        ...itemData,
        userId: user.id,
        tags: {
          create: itemTags.map((name) => ({
            tag: { connect: { id: tags[name] } },
          })),
        },
      },
    });
  }

  // ── React Patterns (3 snippets) ──────────────────────────────────

  await createItem({
    title: "useDebounce Hook",
    description: "Custom hook for debouncing values in React",
    contentType: "text",
    language: "typescript",
    typeId: types["snippet"],
    collectionId: collections["React Patterns"],
    isFavorite: true,
    isPinned: true,
    tagNames: ["react", "hooks", "typescript"],
    content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
  });

  await createItem({
    title: "Context Provider Pattern",
    description: "Type-safe React context with a custom provider and hook",
    contentType: "text",
    language: "typescript",
    typeId: types["snippet"],
    collectionId: collections["React Patterns"],
    isPinned: true,
    tagNames: ["react", "context", "typescript"],
    content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
  });

  await createItem({
    title: "useLocalStorage Hook",
    description: "Persist state to localStorage with SSR safety",
    contentType: "text",
    language: "typescript",
    typeId: types["snippet"],
    collectionId: collections["React Patterns"],
    tagNames: ["react", "hooks", "state"],
    content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
  });

  console.log("  ✓ Created React Patterns items");

  // ── AI Workflows (3 prompts) ─────────────────────────────────────

  await createItem({
    title: "Code Review Prompt",
    description: "Thorough code review with actionable feedback",
    contentType: "text",
    typeId: types["prompt"],
    collectionId: collections["AI Workflows"],
    isFavorite: true,
    tagNames: ["ai", "code-review"],
    content: `Review the following code. For each issue found, provide:
1. The specific line or section
2. What the problem is
3. A suggested fix with code

Focus on: bugs, security vulnerabilities, performance issues, and readability.

\`\`\`
{code}
\`\`\``,
  });

  await createItem({
    title: "Documentation Generator",
    description: "Generate comprehensive documentation from code",
    contentType: "text",
    typeId: types["prompt"],
    collectionId: collections["AI Workflows"],
    tagNames: ["ai", "documentation"],
    content: `Generate documentation for the following code. Include:
- A brief summary of what it does
- Parameters and return types
- Usage examples
- Edge cases and error handling notes

\`\`\`
{code}
\`\`\``,
  });

  await createItem({
    title: "Refactoring Assistant",
    description: "Get refactoring suggestions with explanations",
    contentType: "text",
    typeId: types["prompt"],
    collectionId: collections["AI Workflows"],
    isPinned: true,
    tagNames: ["ai", "refactoring"],
    content: `Analyze the following code and suggest refactoring improvements. For each suggestion:
- Explain the current issue
- Show the refactored version
- Explain why the change improves the code (readability, performance, maintainability)

Keep the public API unchanged unless explicitly asked.

\`\`\`
{code}
\`\`\``,
  });

  console.log("  ✓ Created AI Workflows items");

  // ── DevOps (1 snippet, 1 command, 2 links) ──────────────────────

  await createItem({
    title: "Multi-stage Dockerfile",
    description: "Production-ready multi-stage Docker build for Node.js",
    contentType: "text",
    language: "dockerfile",
    typeId: types["snippet"],
    collectionId: collections["DevOps"],
    isFavorite: true,
    tagNames: ["docker", "deployment"],
    content: `FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --omit=dev

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]`,
  });

  await createItem({
    title: "Deploy with Health Check",
    description: "Docker compose deploy with health check and auto-restart",
    contentType: "text",
    language: "bash",
    typeId: types["command"],
    collectionId: collections["DevOps"],
    tagNames: ["docker", "deployment", "ci-cd"],
    content: `docker compose up -d --build --wait && \\
  docker compose ps && \\
  curl -sf http://localhost:3000/api/health || \\
  (echo "Health check failed!" && docker compose logs --tail=50 && exit 1)`,
  });

  await createItem({
    title: "Kubernetes Documentation",
    description: "Official Kubernetes concepts and reference documentation",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["DevOps"],
    url: "https://kubernetes.io/docs/concepts/",
    tagNames: ["kubernetes", "deployment"],
  });

  await createItem({
    title: "GitHub Actions Docs",
    description: "GitHub Actions workflow syntax and reference",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["DevOps"],
    url: "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions",
    tagNames: ["ci-cd", "deployment"],
  });

  console.log("  ✓ Created DevOps items");

  // ── Terminal Commands (4 commands) ───────────────────────────────

  await createItem({
    title: "Interactive Rebase Last N Commits",
    description: "Squash, reorder, or edit the last N commits",
    contentType: "text",
    language: "bash",
    typeId: types["command"],
    collectionId: collections["Terminal Commands"],
    isPinned: true,
    tagNames: ["git", "shell"],
    content: "git rebase -i HEAD~5",
  });

  await createItem({
    title: "Docker Cleanup",
    description: "Remove all stopped containers, unused images, and dangling volumes",
    contentType: "text",
    language: "bash",
    typeId: types["command"],
    collectionId: collections["Terminal Commands"],
    tagNames: ["docker", "shell"],
    content: "docker system prune -af --volumes",
  });

  await createItem({
    title: "Find and Kill Process on Port",
    description: "Find the process using a specific port and kill it",
    contentType: "text",
    language: "bash",
    typeId: types["command"],
    collectionId: collections["Terminal Commands"],
    isFavorite: true,
    tagNames: ["process", "shell"],
    content: "lsof -ti :3000 | xargs kill -9",
  });

  await createItem({
    title: "Outdated Packages Report",
    description: "List all outdated npm packages with wanted and latest versions",
    contentType: "text",
    language: "bash",
    typeId: types["command"],
    collectionId: collections["Terminal Commands"],
    tagNames: ["npm", "shell"],
    content: "npm outdated --long",
  });

  console.log("  ✓ Created Terminal Commands items");

  // ── Design Resources (4 links) ──────────────────────────────────

  await createItem({
    title: "Tailwind CSS Documentation",
    description: "Official Tailwind CSS utility class reference",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["Design Resources"],
    isFavorite: true,
    url: "https://tailwindcss.com/docs",
    tagNames: ["tailwind", "css"],
  });

  await createItem({
    title: "shadcn/ui Components",
    description: "Beautifully designed components built with Radix and Tailwind",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["Design Resources"],
    url: "https://ui.shadcn.com/docs/components",
    tagNames: ["ui", "design"],
  });

  await createItem({
    title: "Radix UI Primitives",
    description: "Unstyled, accessible UI primitives for React",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["Design Resources"],
    url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
    tagNames: ["ui", "design"],
  });

  await createItem({
    title: "Lucide Icons",
    description: "Beautiful and consistent open-source icon library",
    contentType: "text",
    typeId: types["link"],
    collectionId: collections["Design Resources"],
    url: "https://lucide.dev/icons",
    tagNames: ["icons", "design"],
  });

  console.log("  ✓ Created Design Resources items");

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
