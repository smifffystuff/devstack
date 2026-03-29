# Stripe Integration — Phase 2: Webhooks, Feature Gating & Billing UI

Wires up the live Stripe integration: checkout, customer portal, webhook handler, plan enforcement in server actions, and the billing card in settings. Requires Stripe CLI for local webhook testing.

**Prerequisite:** Phase 1 must be complete (`isPro` on session, plan-limit constants, `src/lib/stripe.ts`).

---

## Goals

- Create checkout session API route (`/api/stripe/checkout`)
- Create customer portal API route (`/api/stripe/portal`)
- Create webhook handler (`/api/webhooks/stripe`)
- Enforce item limit in `createItem` server action
- Enforce collection limit in `createCollection` server action
- Enforce file upload restriction in `/api/items/upload`
- Add `BillingCard` component
- Wire `BillingCard` into the settings page

---

## Stripe Dashboard Setup (Do First)

These manual steps must be completed before running the app end-to-end.

1. **Create a Stripe account** — switch default currency to **GBP** in Settings > Business
2. **Create a Product** — name: "DevStash Pro"
3. **Create two Prices** on the product:
   - Monthly: £8.00 / month, recurring → copy the `price_xxx` ID into `STRIPE_MONTHLY_PRICE_ID`
   - Yearly: £72.00 / year, recurring → copy the `price_xxx` ID into `STRIPE_YEARLY_PRICE_ID`
4. **Enable Customer Portal** — Settings > Customer Portal, allow subscription cancellation and payment method updates
5. **Copy API keys** — Developers > API keys → `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
6. **Set up webhook** for local dev:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

   Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## Implementation Order

1. Create checkout API route
2. Create portal API route
3. Create webhook handler
4. Enforce plan limits in `src/actions/items.ts`
5. Enforce plan limits in `src/actions/collections.ts`
6. Enforce file upload limit in `/api/items/upload/route.ts`
7. Create `BillingCard` component
8. Update settings page to include `BillingCard`

---

## Files to Create

### `src/app/api/stripe/checkout/route.ts`

Creates a Stripe Checkout session and returns the hosted page URL. Creates a Stripe Customer record on first checkout and saves the ID to the user row.

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

### `src/app/api/stripe/portal/route.ts`

Redirects an existing subscriber to the Stripe Customer Portal.

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

### `src/app/api/webhooks/stripe/route.ts`

Handles incoming Stripe events. Must use `request.text()` (raw body) for signature verification — never `request.json()`.

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

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
    data: { isPro: true, stripeSubscriptionId: subscriptionId },
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

### `src/components/dashboard/BillingCard.tsx`

Client component shown on the settings page. Free users see two upgrade buttons; Pro users see a "Manage Billing" button that opens the Customer Portal.

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BillingCardProps {
  isPro: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function BillingCard({ isPro, monthlyPriceId, yearlyPriceId }: BillingCardProps) {
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
        <Button onClick={() => handleCheckout(monthlyPriceId)} disabled={loading}>
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

### `src/actions/items.ts` — enforce item limit in `createItem`

Add after the auth check:

```typescript
if (!session.user.isPro) {
  const count = await prisma.item.count({ where: { userId: session.user.id } });
  if (count >= FREE_ITEM_LIMIT) {
    return {
      success: false,
      error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`,
    };
  }
}
```

### `src/actions/collections.ts` — enforce collection limit in `createCollection`

Add after the auth check:

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

### `src/app/api/items/upload/route.ts` — block file uploads for free users

Add after the auth check, before the upload is processed:

```typescript
if (!session.user.isPro && fileType === "file") {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription" },
    { status: 403 }
  );
}
```

### `src/app/(dashboard)/dashboard/settings/page.tsx` — add BillingCard

The settings page is a server component. Fetch `isPro` from the session and pass the Stripe price IDs as props. Add `BillingCard` above the existing settings cards.

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
      {/* existing cards */}
    </div>
  );
}
```

---

## Testing Checklist

### Integration Tests (requires Stripe CLI in test mode)

- [ ] Checkout flow completes and sets `isPro = true` in database
- [ ] Session reflects `isPro = true` after page reload (no re-login needed)
- [ ] Customer portal loads and shows correct subscription
- [ ] Cancelling subscription sets `isPro = false` and clears `stripeSubscriptionId`
- [ ] `customer.subscription.updated` with `status: "past_due"` sets `isPro = false`
- [ ] Creating a second checkout session for an existing customer reuses the Stripe customer (no duplicate `stripeCustomerId`)

### Manual UI Tests

- [ ] Free user sees "Upgrade" buttons in settings
- [ ] Pro user sees "Manage Billing" button in settings
- [ ] Free user creating item #51 gets limit error toast
- [ ] Free user creating collection #4 gets limit error toast
- [ ] Pro user can create items and collections without limit errors
- [ ] Free user uploading a non-image file gets 403 error
- [ ] Checkout cancel URL returns user to settings without error state

### Edge Cases

- [ ] User with no `stripeCustomerId` clicking portal returns a useful 400 error (not 500)
- [ ] Webhook with invalid signature returns 400
- [ ] Webhook with unknown event type returns `{ received: true }` without erroring

---

## Notes & Decisions

- **`export const dynamic = "force-dynamic"` on webhook route** — required so Next.js does not attempt to pre-render or cache this route. Without it, `request.text()` may fail in some deployment configs.
- **Raw body for webhook** — `request.text()` must be used (not `.json()`). Stripe's signature verification requires the exact raw bytes. Any intermediate parsing invalidates the HMAC check.
- **File upload restriction at the API route layer** — the file is uploaded to R2 before the `createItem` server action runs. Checking only in the action would mean a free user's file lands in R2 but the item is then rejected. The check must happen in the upload route before any bytes are written.
- **`stripeSubscriptionId` set to `null` on cancellation** — distinguishes "has never subscribed" from "was subscribed but cancelled". `stripeCustomerId` remains set to allow re-subscribing without creating a duplicate Stripe customer.
- **Upgrade prompts** — the limit error messages returned by server actions are intentionally descriptive. A follow-up task can add an "Upgrade" link to the toast by detecting this specific error string on the client.
