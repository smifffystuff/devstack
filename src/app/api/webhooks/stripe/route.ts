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
