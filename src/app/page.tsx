"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PurchaseModalProvider } from "@/context/PurchaseModalContext";
import { PurchaseModal } from "@/components/modals/PurchaseModal";
import { SettingsProvider } from "@/lib/settings-context";

// Lazy load all sections for better performance and code splitting
const HeroSection = dynamic(() => import("@/components/sections/HeroSection").then(mod => ({ default: mod.HeroSection })), {
  loading: () => <div className="h-screen" />,
});

const StatsSection = dynamic(() => import("@/components/sections/StatsSection").then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="h-96" />,
});

const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection").then(mod => ({ default: mod.ServicesSection })), {
  loading: () => <div className="h-96" />,
});

const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="h-96" />,
});

const PackagesSection = dynamic(() => import("@/components/sections/PackagesSection").then(mod => ({ default: mod.PackagesSection })), {
  loading: () => <div className="h-96" />,
});

const CTASection = dynamic(() => import("@/components/sections/CTASection").then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="h-96" />,
});

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
