"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const FREE_FEATURES = [
  { text: "Up to 50 items", included: true },
  { text: "3 collections", included: true },
  { text: "All item types", included: true },
  { text: "Full-text search", included: true },
  { text: "Image uploads", included: true },
  { text: "File uploads", included: false },
  { text: "AI features", included: false },
  { text: "Custom item types", included: false },
  { text: "Export (JSON / ZIP)", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited items", included: true },
  { text: "Unlimited collections", included: true },
  { text: "All item types", included: true },
  { text: "Full-text search", included: true },
  { text: "Image & file uploads", included: true },
  { text: "AI auto-tagging", included: true, bold: true },
  { text: "AI summaries & explanations", included: true, bold: true },
  { text: "Custom item types", included: true, bold: true },
  { text: "Export (JSON / ZIP)", included: true, bold: true },
];

export default function PricingToggle() {
  const [isYearly, setIsYearly] = useState(false);

  const proPrice = isYearly ? "$6" : "$8";
  const ctaPrice = isYearly ? "$72/yr" : "$8/mo";

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span
          className={`text-sm transition-colors ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setIsYearly((y) => !y)}
          aria-label="Toggle billing period"
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isYearly ? "bg-blue-500" : "bg-muted"
          }`}
        >
          <span
            className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              isYearly ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm transition-colors flex items-center gap-2 ${
            isYearly ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          Yearly
          {isYearly && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Save 25%
            </Badge>
          )}
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">Free</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
            >
              Get Started Free
            </Link>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-blue-500/40 bg-blue-500/5 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-blue-500 text-white border-0">Most Popular</Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="text-sm font-medium text-blue-400 mb-1">Pro</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{proPrice}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            {isYearly && (
              <p className="text-xs text-muted-foreground mt-1">Billed as $72/year</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span className={f.bold ? "font-semibold" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register?plan=pro"
              className={cn(buttonVariants(), "w-full justify-center")}
            >
              Start Pro — {ctaPrice}
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
