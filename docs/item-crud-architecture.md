# Item CRUD Architecture

A unified system for creating, reading, updating, and deleting all 7 item types through shared routes, actions, and components that adapt based on type.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                        # All item mutations (create, update, delete)
│
├── lib/db/
│   ├── items.ts                        # Item queries (existing + new)
│   └── collections.ts                  # Collection queries (existing)
│
├── app/dashboard/
│   ├── items/
│   │   └── [type]/
│   │       └── page.tsx                # Item list filtered by type
│   ├── item/
│   │   ├── new/
│   │   │   └── page.tsx                # Create new item
│   │   └── [id]/
│   │       ├── page.tsx                # View/read item
│   │       └── edit/
│   │           └── page.tsx            # Edit item
│   └── page.tsx                        # Dashboard home (existing)
│
├── components/items/
│   ├── ItemForm.tsx                     # Unified create/edit form (client)
│   ├── ItemCard.tsx                     # Card for list/grid views
│   ├── ItemList.tsx                     # List view layout
│   ├── ItemActions.tsx                  # Favorite, pin, delete actions (client)
│   ├── ItemContent.tsx                  # Read-only content display
│   ├── ContentEditor.tsx               # Text/markdown editor (client)
│   ├── CodeEditor.tsx                  # Syntax-highlighted editor (client)
│   └── UrlInput.tsx                    # URL input with preview (client)
│
└── types/
    └── items.ts                        # Item-related type definitions
```

---

## Routing

### `/dashboard/items/[type]` — Item List by Type

The `[type]` param is one of the 7 system type names: `snippet`, `prompt`, `command`, `note`, `file`, `image`, `link`.

```tsx
// src/app/dashboard/items/[type]/page.tsx
interface Props {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>;
}

export default async function ItemsByTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { q, tag, sort } = await searchParams;
  // Validate type name against system types
  // Fetch items filtered by type + search/tag/sort
  // Render ItemList with ItemCards
}
```

The sidebar already links type names — these map directly to `/dashboard/items/snippet`, `/dashboard/items/prompt`, etc.

### `/dashboard/item/new?type=snippet` — Create Item

A single create page with a `type` query param that determines which fields appear.

```tsx
// src/app/dashboard/item/new/page.tsx
interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewItemPage({ searchParams }: Props) {
  const { type } = await searchParams;
  // Validate type, fetch user's collections and tags
  // Render ItemForm in create mode
}
```

### `/dashboard/item/[id]` — View Item

```tsx
// src/app/dashboard/item/[id]/page.tsx
export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  // Fetch full item with type, tags, collection
  // Render ItemContent (adapts display by type)
}
```

### `/dashboard/item/[id]/edit` — Edit Item

```tsx
// src/app/dashboard/item/[id]/edit/page.tsx
export default async function EditItemPage({ params }: Props) {
  const { id } = await params;
  // Fetch item, collections, tags
  // Render ItemForm in edit mode with existing data
}
```

---

## Server Actions — `src/actions/items.ts`

One action file handles all item mutations. Server Actions are preferred over API routes for form submissions (per coding standards).

### `createItem`

```tsx
"use server";

import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  typeId: z.string().cuid(),
  contentType: z.enum(["text", "file"]),
  content: z.string().optional(),
  language: z.string().optional(),
  url: z.string().url().optional(),
  collectionId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export async function createItem(formData: z.infer<typeof createItemSchema>) {
  // 1. Authenticate (get session)
  // 2. Validate with Zod
  // 3. Verify typeId belongs to user or is system type
  // 4. Create item with tag connections
  // 5. Revalidate paths
  // 6. Return { success, data, error }
}
```

### `updateItem`

```tsx
const updateItemSchema = createItemSchema.partial().extend({
  id: z.string().cuid(),
});

export async function updateItem(formData: z.infer<typeof updateItemSchema>) {
  // 1. Authenticate
  // 2. Validate
  // 3. Verify ownership (item.userId === session.user.id)
  // 4. Update item, disconnect/reconnect tags
  // 5. Revalidate paths
  // 6. Return { success, data, error }
}
```

### `deleteItem`

```tsx
export async function deleteItem(id: string) {
  // 1. Authenticate
  // 2. Verify ownership
  // 3. Delete item (cascade deletes ItemTags)
  // 4. Revalidate paths
  // 5. Return { success, error }
}
```

### Quick-toggle actions

```tsx
export async function toggleFavorite(id: string) {
  // Toggle isFavorite, revalidate
}

export async function togglePin(id: string) {
  // Toggle isPinned, revalidate
}
```

### Return pattern

All actions follow the project's standard response pattern:

```tsx
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## Data Fetching — `src/lib/db/items.ts`

New query functions added alongside the existing dashboard queries.

### `getItemsByType`

```tsx
export async function getItemsByType(
  userId: string,
  typeName: string,
  options?: { search?: string; tag?: string; sort?: "recent" | "alpha" | "favorites" },
): Promise<DashboardItem[]> {
  // Find typeId from name, then query items
  // Apply search filter on title/description/content
  // Apply tag filter
  // Apply sort order
}
```

### `getItemById`

```tsx
export interface FullItem extends DashboardItem {
  content: string | null;
  contentType: string;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  collectionId: string | null;
  collectionName: string | null;
  tagIds: string[];
}

export async function getItemById(
  userId: string,
  id: string,
): Promise<FullItem | null> {
  // Fetch item with all fields, type, tags, collection
  // Verify ownership via userId
  // Return null if not found or not owned
}
```

### `getFormData`

```tsx
export async function getItemFormData(userId: string) {
  // Parallel fetch: user's collections, tags, system types
  // Returns { collections, tags, types } for form dropdowns
}
```

---

## Component Responsibilities

### `ItemForm` (client component)

The central form component for both create and edit. Adapts its fields based on the selected item type.

```
┌─────────────────────────────────────┐
│  Title input                        │  ← Always shown
│  Description input                  │  ← Always shown
│  Type selector (disabled on edit)   │  ← Always shown
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  TYPE-SPECIFIC SECTION      │    │
│  │                             │    │
│  │  snippet → CodeEditor       │    │  ← Switches based on type
│  │           + language select │    │
│  │  prompt  → ContentEditor    │    │
│  │  command → CodeEditor       │    │
│  │           (lang=bash)       │    │
│  │  note    → ContentEditor    │    │
│  │  file    → FileUpload       │    │
│  │  image   → FileUpload       │    │
│  │  link    → UrlInput         │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  Collection dropdown (optional)     │  ← Always shown
│  Tag multi-select                   │  ← Always shown
│  Favorite / Pinned toggles         │  ← Always shown
│  [Save]                             │
└─────────────────────────────────────┘
```

**Key rule**: Type-specific logic lives in the components, not in the actions. The actions accept the same flat field set for all types — the form decides which fields to populate.

### `ItemContent` (server component)

Read-only display that adapts rendering by type:

| Type | Rendering |
|------|-----------|
| Snippet | Syntax-highlighted code block with language label and copy button |
| Prompt | Rendered text with highlighted `{placeholder}` tokens |
| Command | Monospace code block with copy button |
| Note | Rendered markdown |
| File | File info card with download button |
| Image | Image preview with file info |
| Link | Clickable URL with optional notes |

### `ItemCard`

Compact card for list/grid views. Shows:
- Type icon + color
- Title
- Description (truncated)
- Tags (first 3)
- Favorite/pin indicators
- Quick action buttons (favorite, pin, delete)

### `ItemActions` (client component)

Handles interactive mutations via server actions:
- Toggle favorite (star icon)
- Toggle pin (pin icon)
- Delete with confirmation dialog
- Edit link

### `ItemList`

Layout wrapper for the item list page. Handles:
- Grid/list view toggle
- Empty state per type
- "New item" button linking to `/dashboard/item/new?type={type}`

---

## Type-Specific Logic Placement

| Concern | Location | Why |
|---------|----------|-----|
| Which fields to show | `ItemForm` component | UI concern — form adapts by type |
| Content rendering | `ItemContent` component | Display concern — each type renders differently |
| Validation rules | `src/actions/items.ts` (Zod) | Common schema, type determines which optional fields are expected |
| Content model (text vs file vs url) | `docs/item-types.md` reference | Documented classification drives field usage |
| Icon/color | Database `ItemType` record | Fetched and passed through, not hardcoded in components |

The actions and database layer are **type-agnostic** — they work with the flat `Item` schema fields. Components are where type awareness matters.

---

## Data Flow Summary

```
CREATE:
  ItemForm (client) → createItem action → Prisma insert → revalidatePath

READ LIST:
  /items/[type] page (server) → getItemsByType → ItemList + ItemCards

READ SINGLE:
  /item/[id] page (server) → getItemById → ItemContent

UPDATE:
  /item/[id]/edit page (server) → getItemById → ItemForm (client) → updateItem action

DELETE:
  ItemActions (client) → deleteItem action → Prisma delete → revalidatePath

TOGGLE:
  ItemActions (client) → toggleFavorite/togglePin action → revalidatePath
```

---

## Path Revalidation

After mutations, revalidate these paths to keep server-rendered pages fresh:

```tsx
revalidatePath("/dashboard");              // Stats, recent/pinned items
revalidatePath("/dashboard/items/[type]"); // Item list for affected type
revalidatePath("/dashboard/item/[id]");    // Item detail (on update)
```

---

## Notes

- **No API routes needed** for item CRUD — Server Actions handle all mutations per coding standards
- **File/Image uploads** will need a separate upload flow (Cloudflare R2) before the item is created — the `fileUrl` is set after upload completes
- **Free tier limits** (50 items, 3 collections) should be checked in `createItem` before inserting
- **Search** uses Prisma `contains` for MVP; can upgrade to full-text search later
- **Tags** are connected by ID — the form fetches existing tags and allows creating new ones inline
