# Stripe Integration Plan — DevStash Pro

## Overview

This document is the complete implementation plan for integrating Stripe subscriptions into DevStash. The pricing is **£8/month** or **£72/year** for Pro.

---

## Current State Analysis

### Schema — Ready to Use

The User model already has all Stripe fields defined:

```prisma
model User {
  isPro                Boolean  @default(false)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
}
```

No migrations required.

### NextAuth — Needs `isPro` in Session

Current JWT callback does not sync `isPro` from the database. The session type also needs extending.

**Current (`src/auth.ts`):**
```typescript
callbacks: {
  jwt({ token, user }) {
    if (user?.id) {
      token.sub = user.id
    }
    return token
  },
  session({ session, token }) {
    if (token.sub) {
      session.user.id = token.sub
    }
    return session
  },
}
```

**Problem:** When the Stripe webhook updates `isPro = true`, the active session never picks up the change. The `trigger === "update"` approach from NextAuth docs is unreliable for webhook-driven updates.

**Solution:** Always sync `isPro` from the database in the JWT callback (one small query per session validation, guarantees accuracy after webhooks).

### Plan Limits

From project spec and the homepage `PricingToggle` component:

| Feature | Free | Pro |
|---|---|---|
| Items | 50 | Unlimited |
| Collections | 3 | Unlimited |
| File uploads | No | Yes |
| Image uploads | Yes | Yes |
| AI features | No | Yes |
| Custom item types | No | Yes |
| Export (JSON/ZIP) | No | Yes |

Free plan limits are not yet enforced in any server action.

### API & Action Patterns

All server actions follow:
```typescript
{ success: false, error: "Unauthorized" | fieldErrors | "message" }
{ success: true, data: result }
```

All API routes follow:
```typescript
NextResponse.json({ error: "message" }, { status: 401 | 400 | 500 })
NextResponse.json({ data })
```

---

## Implementation Order

1. Install dependencies & add env vars
2. Create Stripe product + prices in dashboard
3. Update NextAuth session to include `isPro`
4. Create Stripe utility helpers
5. Create checkout session API route
6. Create customer portal API route
7. Create webhook endpoint
8. Enforce plan limits in server actions
9. Add billing UI to settings page
10. Add upgrade prompts at limit boundaries

---

## Files to Create

### 1. `src/lib/stripe.ts` — Stripe client singleton

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
```

### 2. `src/lib/plan-limits.ts` — Free plan constants and checker

```typescript
import { prisma } from "@/lib/prisma";

export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export async function checkItemLimit(userId: string): Promise<boolean> {
  const count = await prisma.item.count({ where: { userId } });
  return count < FREE_ITEM_LIMIT;
}

export async function checkCollectionLimit(userId: string): Promise<boolean> {
  const count = await prisma.collection.count({ where: { userId } });
  return count < FREE_COLLECTION_LIMIT;
}
```

### 3. `src/app/api/stripe/checkout/route.ts` — Create checkout session

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await request.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?upgraded=true`,
    cancel_url: `${appUrl}/dashboard/settings`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### 4. `src/app/api/stripe/portal/route.ts` — Customer portal redirect

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 5. `src/app/api/webhooks/stripe/route.ts` — Webhook handler

This is the most critical file. It must be a raw body handler (no JSON parsing middleware).

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription") {
          await handleSubscriptionActivated(
            checkoutSession.customer as string,
            checkoutSession.subscription as string
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = ["active", "trialing"].includes(subscription.status);
        await handleSubscriptionStatusChange(
          subscription.customer as string,
          subscription.id,
          isActive
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionStatusChange(
          subscription.customer as string,
          subscription.id,
          false
        );
        break;
      }
    }
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionActivated(
  customerId: string,
  subscriptionId: string
) {
  await prisma.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      isPro: true,
      stripeSubscriptionId: subscriptionId,
    },
  });
}

async function handleSubscriptionStatusChange(
  customerId: string,
  subscriptionId: string,
  isActive: boolean
) {
  await prisma.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      isPro: isActive,
      stripeSubscriptionId: isActive ? subscriptionId : null,
    },
  });
}
```

**Important:** The webhook route must opt out of Next.js body parsing. Add this export to the file:

```typescript
export const dynamic = "force-dynamic";
```

### 6. `src/components/dashboard/BillingCard.tsx` — Billing UI for settings page

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BillingCardProps {
  isPro: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function BillingCard({ isPro, monthlyPriceId, yearlyPriceId }: BillingCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Subscription</CardTitle>
            <Badge variant="default">Pro</Badge>
          </div>
          <CardDescription>Manage your Pro subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePortal} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Manage Billing"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Subscription</CardTitle>
          <Badge variant="outline">Free</Badge>
        </div>
        <CardDescription>
          Upgrade to Pro for unlimited items, file uploads, and AI features
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button
          onClick={() => handleCheckout(monthlyPriceId)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Upgrade — £8/month"}
        </Button>
        <Button
          onClick={() => handleCheckout(yearlyPriceId)}
          disabled={loading}
          variant="outline"
        >
          {loading ? "Loading..." : "Upgrade — £72/year"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Files to Modify

### 1. `src/auth.ts` — Sync `isPro` in JWT callback

Replace the existing `callbacks` block:

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

### 2. `src/types/next-auth.d.ts` — Extend Session type

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

### 3. `src/lib/constants.ts` — Add plan limit constants

```typescript
// Existing pagination constants
export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

// Free plan limits
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
```

### 4. `src/actions/items.ts` — Enforce item limit for free users

In `createItem`, add a plan limit check after the session check:

```typescript
export async function createItem(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Enforce free plan item limit
  if (!session.user.isPro) {
    const count = await prisma.item.count({ where: { userId: session.user.id } });
    if (count >= FREE_ITEM_LIMIT) {
      return {
        success: false,
        error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`,
      };
    }
  }

  // ... rest of existing logic
}
```

Also enforce file upload restriction for free users (in the `createItem` action or the upload API route):

```typescript
// In /api/items/upload/route.ts — after auth check
if (!session.user.isPro && fileType === "file") {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription" },
    { status: 403 }
  );
}
```

### 5. `src/actions/collections.ts` — Enforce collection limit for free users

In `createCollection`, add after the session check:

```typescript
if (!session.user.isPro) {
  const count = await prisma.collection.count({ where: { userId: session.user.id } });
  if (count >= FREE_COLLECTION_LIMIT) {
    return {
      success: false,
      error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`,
    };
  }
}
```

### 6. `src/app/(dashboard)/dashboard/settings/page.tsx` — Add BillingCard

Import the server session and pass `isPro` to the BillingCard. The page is a server component so fetch `isPro` with `auth()` or pass it from session:

```typescript
import { auth } from "@/auth";
import { BillingCard } from "@/components/dashboard/BillingCard";

export default async function SettingsPage() {
  const session = await auth();
  const isPro = session?.user?.isPro ?? false;

  return (
    <div className="space-y-6">
      <BillingCard
        isPro={isPro}
        monthlyPriceId={process.env.STRIPE_MONTHLY_PRICE_ID!}
        yearlyPriceId={process.env.STRIPE_YEARLY_PRICE_ID!}
      />
      {/* ... existing cards */}
    </div>
  );
}
```

### 7. `.env.example` — Add Stripe variables

```bash
# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_MONTHLY_PRICE_ID=""
STRIPE_YEARLY_PRICE_ID=""
```

---

## Stripe Dashboard Setup Steps

1. **Create a Stripe account** at stripe.com and switch to **GBP** as the default currency in Settings > Business.

2. **Create a Product**
   - Name: "DevStash Pro"
   - Description: "Unlimited items, file uploads, AI features, and more"

3. **Create two Prices** on the product:
   - Monthly: £8.00 / month, recurring
   - Yearly: £72.00 / year, recurring
   - Copy both Price IDs (they look like `price_xxx`) into your env vars as `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID`

4. **Enable Customer Portal**
   - Go to Settings > Customer Portal
   - Enable subscription cancellation and payment method updates
   - Add your business name and logo

5. **Set up Webhook**
   - Go to Developers > Webhooks > Add endpoint
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - For local dev use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

6. **Copy API keys**
   - Developers > API keys
   - Copy Secret key → `STRIPE_SECRET_KEY`
   - Copy Publishable key → `STRIPE_PUBLISHABLE_KEY`

---

## Testing Checklist

### Unit Tests

- [ ] `checkItemLimit` returns `true` when under limit, `false` when at/over
- [ ] `checkCollectionLimit` returns `true` when under limit, `false` when at/over
- [ ] `createItem` returns error when free user is at item limit
- [ ] `createCollection` returns error when free user is at collection limit
- [ ] `createItem` succeeds when user is Pro regardless of count
- [ ] Webhook handler ignores unknown event types without erroring

### Integration Tests (Stripe CLI / Test Mode)

- [ ] Checkout flow completes and sets `isPro = true` in database
- [ ] Session reflects `isPro = true` after page reload (no re-login needed)
- [ ] Customer portal loads and shows correct subscription
- [ ] Cancelling subscription sets `isPro = false` and clears `stripeSubscriptionId`
- [ ] `customer.subscription.updated` with `status: "past_due"` sets `isPro = false`
- [ ] Creating a second checkout session for an existing customer reuses the Stripe customer

### Manual UI Tests

- [ ] Free user sees "Upgrade" button in settings
- [ ] Pro user sees "Manage Billing" button in settings
- [ ] Free user creating item #51 sees the limit error toast
- [ ] Free user creating collection #4 sees the limit error toast
- [ ] Pro user can create unlimited items and collections
- [ ] Free user uploading a non-image file gets 403 error

### Edge Cases

- [ ] User with no `stripeCustomerId` clicking portal returns a useful error (not 500)
- [ ] Webhook with invalid signature returns 400 (not 500)
- [ ] Stripe checkout cancel URL returns user to settings without error state

---

## Environment Variables Summary

```bash
# Required for Stripe
STRIPE_SECRET_KEY="sk_live_..."        # or sk_test_... for dev
STRIPE_PUBLISHABLE_KEY="pk_live_..."   # used client-side if needed
STRIPE_WEBHOOK_SECRET="whsec_..."      # from Stripe CLI or webhook dashboard
STRIPE_MONTHLY_PRICE_ID="price_..."    # £8/month price
STRIPE_YEARLY_PRICE_ID="price_..."     # £72/year price
```

---

## Notes & Decisions

- **No `@stripe/react-stripe-js` needed** — We redirect to Stripe Checkout (hosted page) rather than embedding a payment element. Simpler, more secure, lower PCI scope.
- **`isPro` sync on every JWT validation** — This is intentional. It adds one `SELECT` query per session but ensures the session is always accurate after webhook updates. Without this, users would need to sign out and back in after upgrading.
- **`stripeSubscriptionId` set to `null` on cancellation** — This makes it easy to check "has ever been a customer" (non-null `stripeCustomerId`) vs "is currently subscribed" (`isPro = true`).
- **File upload restriction is enforced in the upload API route** — This is the right layer because the file never touches the DB until the upload completes. Checking in the server action alone would leave a window where the file was uploaded to R2 but the item creation was blocked.
- **Upgrade prompts** — When a limit error is returned from a server action, the client-side toast should include an "Upgrade" link to `/dashboard/settings`. This can be a follow-up task.
