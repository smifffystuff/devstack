# Current Feature

Prisma + Neon PostgreSQL Setup — Database schema and ORM configuration.

## Status

Completed

## Goals

- Set up Prisma ORM with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Use Prisma 7 (with breaking changes from upgrade guide)
- Always use migrations (`prisma migrate dev`), never push directly

## Notes

- Spec: @context/features/database-spec.md
- Data models reference: @context/project-overview.md
- Database standards: @context/coding-standards.md
- Prisma 7 upgrade guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma setup guide: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
- Separate dev and production database branches; DATABASE_URL points to dev branch

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
