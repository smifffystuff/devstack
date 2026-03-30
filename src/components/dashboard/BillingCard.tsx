"use client";

import { useState } from "react";
import { toast } from "sonner";
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
      if (!res.ok) {
        toast.error(data.error ?? "Failed to start checkout");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to open billing portal");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to open billing portal");
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
