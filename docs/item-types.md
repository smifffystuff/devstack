# Item Types Reference

DevStash ships with 7 system item types. Pro users can also create custom types.

---

## System Types

### 1. Snippet

| Property | Value |
|----------|-------|
| Icon | `Code` (Lucide) |
| Color | `#3b82f6` (blue) |
| Purpose | Store reusable code snippets with syntax highlighting |
| Content model | Text — uses `content` + `language` fields |

Snippets are text-based items with an associated programming language for syntax highlighting. Examples: React hooks, utility functions, Dockerfiles.

---

### 2. Prompt

| Property | Value |
|----------|-------|
| Icon | `Sparkles` (Lucide) |
| Color | `#8b5cf6` (purple) |
| Purpose | Store AI prompts and prompt templates |
| Content model | Text — uses `content` field |

Prompts hold reusable AI prompt text. Typically contain placeholder tokens like `{code}` for substitution. Examples: code review prompts, documentation generators.

---

### 3. Command

| Property | Value |
|----------|-------|
| Icon | `Terminal` (Lucide) |
| Color | `#f97316` (orange) |
| Purpose | Store shell commands and one-liners |
| Content model | Text — uses `content` + `language` fields (usually `bash`) |

Commands store terminal one-liners or short scripts. The `language` field is typically `"bash"`. Examples: git commands, Docker cleanup, process management.

---

### 4. Note

| Property | Value |
|----------|-------|
| Icon | `StickyNote` (Lucide) |
| Color | `#fde047` (yellow) |
| Purpose | Freeform text notes, documentation, and markdown content |
| Content model | Text — uses `content` field |

Notes are general-purpose text items for documentation, reference material, or personal notes. Supports markdown editing.

---

### 5. File

| Property | Value |
|----------|-------|
| Icon | `File` (Lucide) |
| Color | `#6b7280` (gray) |
| Purpose | Store uploaded files (documents, templates, configs) |
| Content model | File — uses `fileUrl`, `fileName`, `fileSize` fields |
| Plan | **Pro only** |

File items represent uploaded documents stored in Cloudflare R2. The `contentType` is `"file"` rather than `"text"`.

---

### 6. Image

| Property | Value |
|----------|-------|
| Icon | `Image` (Lucide) |
| Color | `#ec4899` (pink) |
| Purpose | Store uploaded images (screenshots, diagrams, references) |
| Content model | File — uses `fileUrl`, `fileName`, `fileSize` fields |
| Plan | **Pro only** |

Image items are file uploads specifically for visual content. Like File, they use the file-based content model.

---

### 7. Link

| Property | Value |
|----------|-------|
| Icon | `Link` (Lucide) |
| Color | `#10b981` (green) |
| Purpose | Store bookmarked URLs and web references |
| Content model | URL — uses `url` field, may optionally use `content` for notes |

Link items store external URLs. The `url` field holds the destination. Optional `content` can hold additional notes about the resource.

---

## Content Classification

Items fall into three content models based on their `contentType` field and which Item fields they use:

| Classification | `contentType` | Primary fields | Types |
|---------------|---------------|----------------|-------|
| **Text** | `"text"` | `content`, `language` (optional) | Snippet, Prompt, Command, Note |
| **File** | `"file"` | `fileUrl`, `fileName`, `fileSize` | File, Image |
| **URL** | `"text"` | `url` | Link |

> Note: Link items currently use `contentType: "text"` in the seed data, not a separate `"url"` type. The `url` field distinguishes them.

---

## Shared Properties

Every item, regardless of type, has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `String` | Required — display name |
| `description` | `String?` | Optional summary |
| `isFavorite` | `Boolean` | Star/favorite toggle (default: false) |
| `isPinned` | `Boolean` | Pin to top of dashboard (default: false) |
| `tags` | `ItemTag[]` | Many-to-many tag associations |
| `collection` | `Collection?` | Optional parent collection |
| `createdAt` | `DateTime` | Auto-set creation timestamp |
| `updatedAt` | `DateTime` | Auto-updated on change |

---

## Display Differences

| Type | Syntax highlighting | File preview | URL link | Language badge |
|------|---------------------|-------------|----------|---------------|
| Snippet | Yes | — | — | Yes |
| Prompt | — | — | — | — |
| Command | Yes | — | — | Yes (bash) |
| Note | Markdown rendering | — | — | — |
| File | — | Download/preview | — | — |
| Image | — | Image thumbnail | — | — |
| Link | — | — | Clickable URL | — |

---

## Icon Mapping

The shared icon map lives in `src/lib/item-type-icons.ts` and maps the `icon` string stored in the database to Lucide React components:

```typescript
ICON_MAP: {
  Code      → Snippet
  Sparkles  → Prompt
  Terminal  → Command
  StickyNote → Note
  File      → File
  Image     → Image
  Link      → Link
}
```

---

## Custom Types (Pro)

Pro users can create custom `ItemType` records with:
- A custom `name`
- An optional `icon` (from the Lucide icon set)
- An optional `color` (hex)
- `isSystem: false` and linked to their `userId`

Custom types follow the same Item schema — they use the existing `content`, `fileUrl`, and `url` fields based on what content model fits.

The `@@unique([userId, name])` constraint on `ItemType` ensures type names are unique per user (system types have `userId: null`).
