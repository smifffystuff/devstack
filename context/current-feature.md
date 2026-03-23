# Current Feature: Code Editor

## Status

In Progress

## Goals

- Create CodeEditor component using Monaco Editor with dark theme
- Replace Textarea with CodeEditor for snippets and commands only
- Keep Textarea for notes, prompts, and other non-code types
- Add macOS-style window dots (red/yellow/green) at top of editor
- Add quick copy button in editor header
- Add the language in editor header next to copy
- Support both display (readonly) and edit modes
- Make the height of the editor fluid but a max height of 400px with a themed scrollbar

## Notes

- Monaco Editor is the editor that powers VS Code — provides syntax highlighting, language support, and a rich editing experience
- Only snippets and commands get the code editor; notes, prompts, and links keep using Textarea
- The editor needs two modes: readonly for viewing in the item drawer, and editable for edit mode

## History

- 2026-03-16: Initial Next.js and Tailwind CSS setup, project context files added
- 2026-03-16: Started Dashboard UI Phase 1
- 2026-03-16: Completed Dashboard UI Phase 1 — ShadCN init, /dashboard route, dark mode, top bar with search and buttons, sidebar/main placeholders
- 2026-03-16: Started Dashboard UI Phase 2
- 2026-03-16: Completed Dashboard UI Phase 2 — Collapsible sidebar with color-coded type icons and links, favorite/recent collections, user avatar area, mobile drawer, desktop toggle
- 2026-03-16: Started Dashboard UI Phase 3
- 2026-03-16: Completed Dashboard UI Phase 3 — Stats cards, recent collections grid, pinned items list, recent items list, ShadCN card/badge components
- 2026-03-17: Started Prisma + Neon PostgreSQL Setup
- 2026-03-17: Completed Prisma + Neon PostgreSQL Setup — Prisma 7 with Neon adapter, full schema with NextAuth models, indexes, cascade deletes, seed script with mock data, initial migration applied
- 2026-03-17: Started Seed Data
- 2026-03-17: Completed Seed Data — Demo user with hashed password, 7 system item types, 5 collections with 18 items, 22 tags, seed command configured in prisma.config.ts
- 2026-03-17: Started Dashboard Collections
- 2026-03-17: Completed Dashboard Collections — Prisma data fetching in src/lib/db/collections.ts, server component fetches real collections, colored left border from dominant type, small type icons per collection, mock data removed from collections display
- 2026-03-17: Started Dashboard Items
- 2026-03-17: Completed Dashboard Items — Prisma data fetching in src/lib/db/items.ts, server component fetches real pinned/recent items and stats, icon/color derived from item type, empty pinned section hidden, mock data removed from items and stats display
- 2026-03-17: Started Stats & Sidebar
- 2026-03-17: Completed Stats & Sidebar — Real item type counts and collections in sidebar from database, colored circles for recents, yellow star for favorites, "View all collections" link, sidebar data via context provider
- 2026-03-18: Started Add Pro Badge
- 2026-03-18: Completed Add Pro Badge — PRO badge on File and Image types in sidebar using ShadCN Badge component, outline variant, subtle sizing
- 2026-03-18: Started Quick-Win Cleanup
- 2026-03-18: Completed Quick-Win Cleanup — Extracted shared ICON_MAP, moved capitalize/formatDate to utils, added aria-labels, DATABASE_URL runtime guard, renamed RecentCollection to CollectionSummary
- 2026-03-20: Completed Auth Setup — NextAuth v5 with GitHub OAuth, split config for edge compatibility, PrismaAdapter with JWT strategy, proxy protecting /dashboard/* routes, Session type extended with user.id
- 2026-03-20: Completed Auth Credentials — Credentials provider with split pattern (placeholder in auth.config.ts, bcrypt validation in auth.ts), registration API route at /api/auth/register with input validation
- 2026-03-20: Completed Auth UI — Custom sign-in page with email/password and GitHub OAuth, register page with validation and success toast, reusable UserAvatar component, sidebar dropdown with sign-out, session-based dashboard replacing demo user
- 2026-03-20: Completed Email Verification — Resend integration, verification token generation, verify API route, check-your-email page with status states, unverified users blocked from sign-in
- 2026-03-20: Completed Email Verification Toggle — ENABLE_EMAIL_VERIFICATION env var, auto-verify users when disabled, skip verification check on sign-in, dynamic redirect after registration
- 2026-03-21: Completed Forgot Password — Forgot password link on sign-in, /forgot-password email form, /reset-password with token validation, /api/auth/reset-password route, reused VerificationToken model with 1hr expiry, email enumeration prevention
- 2026-03-21: Completed Profile Page — /dashboard/profile route with user info, usage stats with type breakdown, change password dialog (email users only), delete account with DELETE confirmation, ShadCN dialog/alert-dialog components
- 2026-03-21: Completed Rate Limiting for Auth — Upstash Redis + sliding window rate limits on login, register, forgot-password, reset-password routes, reusable rate-limit utility, custom /api/auth/login pre-check route, 429 responses with Retry-After header, fail-open design
- 2026-03-21: Completed Convert Auth Pages to SSR — Extracted 5 client components (SignInForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, VerifyEmailStatus) into src/components/auth/, pages are now server components, searchParams read server-side for reset-password and verify-email
- 2026-03-22: Completed Vitest Setup — Vitest configured for unit testing server actions and utilities only (.test.ts), sample tests for utils, npm test and test:watch scripts, updated docs
- 2026-03-22: Completed Relative Dates — relativeDate() utility for item cards showing "Just now", "5m ago", "Yesterday", etc., applied to ItemCard, RecentItems, PinnedItems, with 7 unit tests
- 2026-03-22: Completed Items List View — Dynamic /dashboard/items/[type] route with type-filtered items, ItemCard component, 3-column responsive grid (1/2/3 cols), sidebar links fixed to /dashboard/items/ path
- 2026-03-22: Completed Item Drawer — Right-side Sheet drawer for item details, action bar (favorite/pin/copy/edit/delete), /api/items/[id] route with auth, getItemById query, ItemDrawerProvider context, skeleton loading, works on dashboard and items list pages
- 2026-03-22: Completed Item Drawer Edit Mode — Inline edit mode via pencil button, editable title/description/tags + type-specific fields (content/language/url), Zod validation schema, updateItem server action and query with tag disconnect/reconnect, toast feedback, 13 validation tests
- 2026-03-22: Completed Delete Item — AlertDialog confirmation in item drawer, deleteItem server action and db query with auth check, success/error toast, drawer close and UI refresh on delete, 5 unit tests
- 2026-03-23: Completed Item Create — New Item dialog from top bar, type selector (snippet/prompt/command/note/link), dynamic fields per type, createItem server action and db query with Zod validation, toast feedback, 13 unit tests
