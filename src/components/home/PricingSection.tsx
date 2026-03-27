import ScrollReveal from "./ScrollReveal";
import PricingToggle from "./PricingToggle";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Start free. Upgrade when you need more power.
          </p>
        </ScrollReveal>

        <PricingToggle />
      </div>
    </section>
  );
}
