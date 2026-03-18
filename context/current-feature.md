# Current Feature

Add Pro Badge — Add a PRO badge to File and Image item types in the sidebar.

## Status

In Progress

## Goals

- Add a PRO badge next to File and Image types in the sidebar
- Use ShadCN UI Badge component
- Keep badge clean and subtle
- PRO text in all uppercase

## Notes

- Spec: @context/features/add-pro-badge-spec.md

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
