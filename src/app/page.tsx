"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { CTASection } from "@/components/sections/CTASection";
import { PurchaseModalProvider } from "@/context/PurchaseModalContext";
import { PurchaseModal } from "@/components/modals/PurchaseModal";
import { SettingsProvider } from "@/lib/settings-context";

export default function Home() {
  return (
    <SettingsProvider>
      <PurchaseModalProvider>
        <Header />
        <main>
          <HeroSection />
          <StatsSection />
          <ServicesSection />
          <FeaturesSection />
          <PackagesSection />
          <CTASection />
        </main>
        <Footer />
        <PurchaseModal />
      </PurchaseModalProvider>
    </SettingsProvider>
  );
}
