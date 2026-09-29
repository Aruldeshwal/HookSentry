import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveSandbox } from "@/components/landing/InteractiveSandbox";
import { SpecsBenchmarks } from "@/components/landing/SpecsBenchmarks";
import { ArchitectureBlueprint } from "@/components/landing/ArchitectureBlueprint";
import { TierSection } from "@/components/landing/TierSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <InteractiveSandbox />
        <SpecsBenchmarks />
        <ArchitectureBlueprint />
        <TierSection />
      </main>
      <Footer />
    </div>
  );
}
