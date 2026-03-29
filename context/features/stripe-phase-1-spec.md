# Stripe Integration — Phase 1: Core Infrastructure

Sets up the Stripe client, session `isPro` sync, plan-limit constants, and unit-tested limit helpers. No live Stripe calls are made in this phase — everything is testable in isolation.

---

## Goals

- Install `stripe` npm package and wire env vars
- Expose `isPro` on the NextAuth session (synced from DB on every JWT validation)
- Add plan-limit constants to `src/lib/constants.ts`
- Create `src/lib/plan-limits.ts` with `checkItemLimit` / `checkCollectionLimit`
- Unit tests covering both limit helpers
- Update `.env.example` with all five Stripe variables

---

## Implementation Order

1. Install dependency
2. Add env vars to `.env.example` and `.env`
3. Create `src/lib/stripe.ts`
4. Update `src/types/next-auth.d.ts`
5. Update `src/auth.ts` callbacks
6. Update `src/lib/constants.ts`
7. Create `src/lib/plan-limits.ts`
8. Write unit tests

---

## Files to Create

### `src/lib/stripe.ts`

Stripe client singleton — import this everywhere instead of calling `new Stripe(...)` inline.

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
```

### `src/lib/plan-limits.ts`

Helpers that check whether a free user is at their limit. Return `true` when the action is allowed, `false` when blocked.

```typescript
import { prisma } from "@/lib/prisma";
import { FREE_ITEM_LIMIT, FREE_COLLECTION_LIMIT } from "@/lib/constants";

export async function checkItemLimit(userId: string): Promise<boolean> {
  const count = await prisma.item.count({ where: { userId } });
  return count < FREE_ITEM_LIMIT;
}

export async function checkCollectionLimit(userId: string): Promise<boolean> {
  const count = await prisma.collection.count({ where: { userId } });
  return count < FREE_COLLECTION_LIMIT;
}
```

### `src/lib/plan-limits.test.ts`

Unit tests using Vitest with a mocked Prisma client.

Test cases:

**`checkItemLimit`**
- returns `true` when count is 0 (well under limit)
- returns `true` when count is 49 (one below limit)
- returns `false` when count is 50 (at limit)
- returns `false` when count is 60 (over limit)

**`checkCollectionLimit`**
- returns `true` when count is 0
- returns `true` when count is 2 (one below limit)
- returns `false` when count is 3 (at limit)
- returns `false` when count is 5 (over limit)

---

## Files to Modify

### `src/types/next-auth.d.ts`

Extend `Session` and `JWT` to include `isPro`:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
```

### `src/auth.ts` — callbacks

Replace the existing `callbacks` block. The JWT callback now fetches `isPro` from the DB on every validation so webhook-driven status changes are reflected without requiring a sign-out.

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user?.id) {
      token.sub = user.id;
    }

    // Always sync isPro from DB — catches webhook-driven updates
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }

    return token;
  },
  session({ session, token }) {
    if (token.sub) {
      session.user.id = token.sub;
    }
    if (typeof token.isPro === "boolean") {
      session.user.isPro = token.isPro;
    }
    return session;
  },
},
```

### `src/lib/constants.ts`

Append plan-limit constants below the existing pagination constants:

```typescript
// Free plan limits
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
```

### `.env.example`

Add Stripe variables:

```bash
# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_MONTHLY_PRICE_ID=""
STRIPE_YEARLY_PRICE_ID=""
```

---

## Notes & Decisions

- **One DB query per session validation** — `isPro` is fetched on every JWT callback. This adds a single `SELECT` but means the session is always accurate after a webhook update. Without this, a user would need to sign out and back in after upgrading.
- **`plan-limits.ts` imports constants** — keeps the magic numbers in one place (`constants.ts`) and makes the helpers testable without touching the DB values.
- **No Stripe Dashboard setup required** — Phase 1 does not make any real Stripe API calls. Env vars can be empty strings locally until Phase 2.
