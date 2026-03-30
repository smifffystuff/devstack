import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UpgradePricing } from "@/components/dashboard/UpgradePricing";

export default async function UpgradePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.isPro) {
    redirect("/dashboard/settings");
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Upgrade to Pro
        </h1>
        <p className="text-muted-foreground">
          Unlock unlimited items, file uploads, AI features, and more.
        </p>
      </div>

      <UpgradePricing
        monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
        yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
      />
    </div>
  );
}
