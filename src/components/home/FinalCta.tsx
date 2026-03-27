import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";

export default function FinalCta() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-card/30 border-t border-border">
      <ScrollReveal className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Organize Your Knowledge?
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Join developers who stash smarter, not harder.
        </p>
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
          Get Started — It&apos;s Free
        </Link>
      </ScrollReveal>
    </section>
  );
}
