export const mockUser = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  isPro: false,
  createdAt: new Date('2026-03-16'),
  updatedAt: new Date('2026-03-16'),
};

export const mockItemTypes = [
  { id: "type_snippet", name: "Snippet", icon: "code", color: "#6366f1", isSystem: true },
  { id: "type_prompt", name: "Prompt", icon: "sparkles", color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "Command", icon: "terminal", color: "#06b6d4", isSystem: true },
  { id: "type_note", name: "Note", icon: "file-text", color: "#10b981", isSystem: true },
  { id: "type_file", name: "File", icon: "paperclip", color: "#f59e0b", isSystem: true },
  { id: "type_image", name: "Image", icon: "image", color: "#ec4899", isSystem: true },
  { id: "type_url", name: "URL", icon: "link", color: "#3b82f6", isSystem: true },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-14T00:00:00Z",
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z",
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    createdAt: "2023-12-20T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    createdAt: "2023-12-15T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "col_7",
    name: "Python Snippets",
    description: "More Python utilities",
    itemCount: 8,
    isFavorite: false,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
  },
  {
    id: "col_8",
    name: "Interview Prep",
    description: "Additional prep materials",
    itemCount: 24,
    isFavorite: false,
    createdAt: "2023-12-28T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
  },
];

export const mockItems = [
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
    typeName: "Snippet",
    collectionId: "col_1",
    collectionName: "React Patterns",
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
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
    typeName: "Snippet",
    collectionId: "col_1",
    collectionName: "React Patterns",
    tags: ["api", "error-handling", "typescript"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "item_3",
    title: "Git Undo Last Commit",
    description: "Undo last commit but keep changes staged",
    contentType: "text",
    content: "git reset --soft HEAD~1",
    language: "bash",
    typeId: "type_command",
    typeName: "Command",
    collectionId: "col_5",
    collectionName: "Git Commands",
    tags: ["git", "undo"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z",
  },
  {
    id: "item_4",
    title: "Explain Code Prompt",
    description: "Prompt to get a clear explanation of any code block",
    contentType: "text",
    content: "Explain the following code in simple terms. Describe what it does, how it works, and any potential edge cases or issues:\n\n```\n{code}\n```",
    language: null,
    typeId: "type_prompt",
    typeName: "Prompt",
    collectionId: "col_6",
    collectionName: "AI Prompts",
    tags: ["ai", "explain", "code-review"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
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
    typeName: "Snippet",
    collectionId: "col_2",
    collectionName: "Python Snippets",
    tags: ["python", "list", "comprehension"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
  },
  {
    id: "item_6",
    title: "Tailwind Dark Mode Setup",
    description: "Quick setup note for Tailwind dark mode with Next.js",
    contentType: "text",
    content: "Use `next-themes` package with `ThemeProvider`. Wrap the app in `layout.tsx` and set `attribute='class'` so Tailwind's `dark:` variants work based on the `dark` class on `<html>`.",
    language: null,
    typeId: "type_note",
    typeName: "Note",
    collectionId: "col_1",
    collectionName: "React Patterns",
    tags: ["tailwind", "dark-mode", "next.js"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
  },
];

export const mockTypeCounts = [
  { typeId: "type_snippet", name: "Snippets", count: 24 },
  { typeId: "type_prompt", name: "Prompts", count: 18 },
  { typeId: "type_command", name: "Commands", count: 15 },
  { typeId: "type_note", name: "Notes", count: 12 },
  { typeId: "type_file", name: "Files", count: 5 },
  { typeId: "type_image", name: "Images", count: 3 },
  { typeId: "type_url", name: "Links", count: 8 },
];
