# Current Feature: Email Verification on Register

## Status
In Progress

## Goals
- Send a verification email via Resend when a user registers
- Email contains a unique verification link the user must click
- Clicking the link marks the user's email as verified
- Unverified users cannot access the dashboard (redirect to a "check your email" page)
- Use `onboarding@resend.dev` as the sender address
- Store verification token in the database with expiration

## Notes
- Using Resend as the email provider (RESEND_API_KEY already in .env)
- From address: onboarding@resend.dev (Resend's test sender)
- Integrate with the existing NextAuth + credentials registration flow
- Add an `emailVerified` field / verification token model to the database

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
