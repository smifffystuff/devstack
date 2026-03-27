import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import AiSection from "@/components/home/AiSection";
import PricingSection from "@/components/home/PricingSection";
import FinalCta from "@/components/home/FinalCta";
import Footer from "@/components/home/Footer";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <AiSection />
      <PricingSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
