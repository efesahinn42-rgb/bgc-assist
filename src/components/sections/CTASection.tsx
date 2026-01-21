"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, ChevronRight, Clock, MapPin, Shield } from "lucide-react";
import { getDefaultPackage } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";
import { useSettings } from "@/lib/settings-context";

const ctaFeatures = [
  { icon: Clock, text: "7/24 Hizmet" },
  { icon: MapPin, text: "81 İlde Kapsama" },
  { icon: Shield, text: "Garantili Hizmet" },
];

export function CTASection() {
  const { openModal } = usePurchaseModal();
  const { settings } = useSettings();

  // Format phone for tel: links (remove spaces)
  const phoneLink = settings.phone.replace(/\s/g, "");

  const handleOpenPurchaseModal = () => {
    const defaultPackage = getDefaultPackage();
    openModal(defaultPackage);
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Image - Tow Truck Scene */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1742069029207-0aacf8fa4401?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-brand-black/85" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/30 rounded-full px-5 py-2 mb-8"
          >
            <Phone className="w-4 h-4 text-brand-red" />
            <span className="text-brand-red font-medium">Acil Yardım Hattı</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-white mb-6 leading-tight"
          >
            Yolda Kalmayı <span className="text-brand-red">Beklemek</span> Yok!
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-brand-white/80 mb-10 max-w-2xl mx-auto"
          >
            Tek bir arama ile profesyonel ekibimiz dakikalar içinde yanınızda.
            Hemen arayın, yardım gelsin.
          </motion.p>

          {/* Phone Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <a
              href={`tel:+90${phoneLink}`}
              suppressHydrationWarning
              className="inline-flex items-center gap-4 bg-brand-white rounded-2xl px-8 py-5 shadow-2xl hover:shadow-brand-red/20 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 rounded-xl bg-brand-red flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-7 h-7 text-brand-white" />
              </div>
              <div className="text-left">
                <div className="text-sm text-brand-gray font-medium">Hemen Arayın</div>
                <div className="text-2xl md:text-3xl font-bold text-brand-black">{settings.phone}</div>
              </div>
            </a>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-brand-red hover:bg-brand-red-dark text-brand-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold shadow-lg shadow-brand-red/30 min-h-[44px] touch-manipulation"
              onClick={handleOpenPurchaseModal}
            >
              Online Yardım Talebi
              <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-brand-white bg-brand-white/10 text-brand-white hover:bg-brand-white hover:text-brand-black text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold backdrop-blur-sm min-h-[44px] touch-manipulation"
              onClick={handleOpenPurchaseModal}
            >
              Paket Satın Al
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8"
          >
            {ctaFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 text-brand-white/80">
                  <Icon className="w-5 h-5 text-brand-red" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
