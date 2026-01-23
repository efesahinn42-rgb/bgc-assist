"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, Zap, Shield, Star, Users, Crown, Truck, LucideIcon } from "lucide-react";
import { packages as staticPackages, Package } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";

import "swiper/css";
import "swiper/css/navigation";

// Icon mapping for API packages
const iconMap: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Star,
  Users,
  Crown,
  Truck,
};

export function PackagesSection() {
  const { openModal } = usePurchaseModal();
  const [packages, setPackages] = useState<Package[]>(staticPackages);
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/packages?active=true");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Map API packages to Package interface
          const mappedPackages: Package[] = data.map((pkg: any) => ({
            name: pkg.name,
            price: pkg.price.toString(),
            period: pkg.period,
            description: pkg.description,
            icon: iconMap[pkg.icon] || Star,
            popular: pkg.popular || false,
            color: pkg.color || "bg-blue-500",
            features: Array.isArray(pkg.features) ? pkg.features : [],
            notIncluded: Array.isArray(pkg.notIncluded) ? pkg.notIncluded : [],
          }));
          setPackages(mappedPackages);
        }
      }
    } catch (err) {
      console.error("Error fetching packages, using static:", err);
      // Keep static packages on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Find popular package index
  const popularIndex = packages.findIndex(pkg => pkg.popular);

  // Calculate initial slide to center popular package
  // Desktop'ta 3 paket görünüyorsa, popüler paketi ortada göstermek için
  // Slide'ta ortadaki pozisyon index'i = popularIndex - initialSlide = 1
  // Yani initialSlide = popularIndex - 1
  // Sınırları kontrol ediyoruz:
  // - Eğer popularIndex < 1 ise, initialSlide = 0 (ilk slide)
  // - Eğer popularIndex >= packages.length - 1 ise, initialSlide = packages.length - 3 (son slide)
  // - Diğer durumlarda: initialSlide = popularIndex - 1
  const initialSlide = popularIndex >= 0 && packages.length >= 3
    ? Math.max(0, Math.min(popularIndex - 1, packages.length - 3))
    : 0;

  return (
    <section id="packages" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Refined Soft Background */}
      <div className="absolute inset-0 bg-slate-100/80" />

      {/* Subtle Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.5]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(220, 38, 38, 0.06) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />

      {/* Soft gradient orbs */}
      <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-orange-100/50 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-brand-red/10 text-brand-red px-5 py-2.5 rounded-full text-sm font-semibold mb-4 border border-brand-red/20 uppercase tracking-widest">
            Paketlerimiz
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-6">
            Size Uygun <span className="text-brand-red">Paketi</span> Seçin
          </h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto leading-relaxed">
            İhtiyacınıza göre esnek paket seçenekleri. Tüm paketlerde 7/24 destek garantisi.
          </p>
        </motion.div>

        {/* Packages Slider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Swiper
            key={`packages-${packages.length}-${popularIndex}`}
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={true}
            initialSlide={initialSlide}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            className="packages-swiper !pb-4"
          >
            {packages.map((pkg, index) => {
              const Icon = pkg.icon;
              return (
                <SwiperSlide key={index} className="!h-auto">
                  <div className={`relative h-full ${pkg.popular ? "pt-4" : ""}`}>
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-brand-red text-brand-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                          En Popüler
                        </div>
                      </div>
                    )}

                    <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white ${pkg.popular
                      ? "border-2 border-brand-red shadow-xl"
                      : "border-0 shadow-lg shadow-stone-200/60 hover:shadow-xl"
                      }`}>
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className={`p-6 lg:p-8 ${pkg.popular ? "bg-brand-red" : "bg-white"}`}>
                          <div className={`h-1 w-16 rounded-full mb-4 ${pkg.popular ? "bg-white/30" : pkg.color}`} />
                          <div className={`w-12 h-12 rounded-xl ${pkg.popular ? "bg-brand-white/20" : `${pkg.color}/10`
                            } flex items-center justify-center mb-4`}>
                            <Icon className={`w-6 h-6 ${pkg.popular ? "text-brand-white" : pkg.color.replace('bg-', 'text-')}`} />
                          </div>
                          <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${pkg.popular ? "text-brand-white" : "text-brand-black"}`}>
                            {pkg.name}
                          </h3>
                          <p className={`text-sm ${pkg.popular ? "text-brand-white/80" : "text-brand-gray"}`}>
                            {pkg.description}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="px-6 lg:px-8 py-6 border-b border-gray-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl lg:text-4xl font-bold text-brand-black">₺{pkg.price}</span>
                            <span className="text-brand-gray text-sm">/{pkg.period}</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="p-6 lg:p-8">
                          <ul className="space-y-3 mb-6">
                            {pkg.features.slice(0, 6).map((feature, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                                <span className="text-brand-black text-sm">{feature}</span>
                              </li>
                            ))}
                            {pkg.notIncluded.slice(0, 2).map((feature, i) => (
                              <li key={`not-${i}`} className="flex items-start gap-3 opacity-50">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs text-gray-400">−</span>
                                </div>
                                <span className="text-brand-gray line-through text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => openModal(pkg)}
                            className={`w-full py-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 min-h-[44px] touch-manipulation ${pkg.popular
                              ? "bg-brand-red hover:bg-brand-red-dark text-white"
                              : "bg-brand-black hover:bg-brand-black/90 text-white"
                              }`}
                          >
                            Hemen Satın Al
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </motion.div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-brand-gray mt-10"
        >
          Tüm fiyatlara KDV dahildir. Kurumsal paketler için{" "}
          <a
            href="#contact"
            className="text-brand-red hover:underline font-medium"
            suppressHydrationWarning
          >
            bizimle iletişime geçin
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
