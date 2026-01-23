"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, ShieldCheck, Clock, MapPin, Users, Star, Activity, Car, Loader2 } from "lucide-react";
import { getPackageByCategory } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";
import Link from "next/link";
import Image from "next/image";

// Swiper CSS imports
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

// Icon mapping for stats
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  MapPin,
  Users,
  Star,
  Activity,
  Car,
  ShieldCheck,
};

interface SliderStat {
  icon: string;
  label: string;
  value: string;
}

interface Slider {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  color: string;
  stats: SliderStat[];
  order: number;
  isActive: boolean;
}

// Color mapping for categories
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
  slate: { bg: "bg-slate-500", text: "text-slate-500", border: "border-slate-500" },
  violet: { bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
};

// Static slider data as fallback
const staticSliders: Slider[] = [
  {
    id: "1",
    category: "Otomobil",
    title: "Yolda Kalmak Yok, Devam Etmek Var.",
    description: "Binek araçlarınız için 7/24 çekici, yerinde akü ve lastik değişimi hizmeti. Ailenizle güvenle seyahat edin.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop",
    color: "blue",
    stats: [
      { icon: "Clock", label: "Ort. Varış", value: "18 Dk" },
      { icon: "MapPin", label: "Hizmet Ağı", value: "81 İl" },
      { icon: "Users", label: "Mutlu Müşteri", value: "10K+" },
    ],
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    category: "Motosiklet",
    title: "İki Teker Özgürlüktür, Biz Güvencesiyiz.",
    description: "Motosikletlere özel aparatlı çekicilerimizle, motorunuzu çizmeden, devirmeden güvenle taşıyoruz.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop",
    color: "orange",
    stats: [
      { icon: "ShieldCheck", label: "Güvenlik", value: "%100" },
      { icon: "Star", label: "Memnuniyet", value: "4.9/5" },
      { icon: "Activity", label: "Operasyon", value: "7/24" },
    ],
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    category: "Hafif Ticari",
    title: "Esnafın Yükünü Hafifletiyoruz.",
    description: "Doblo, Transporter ve Panelvan araçlarınız arızalandığında işiniz aksamasın. Hızlı müdahale ekibi hazır.",
    image: "https://images.unsplash.com/photo-1656426650699-a76ffe479608?q=80&w=1920&auto=format&fit=crop",
    color: "emerald",
    stats: [
      { icon: "Activity", label: "Yük Kapasitesi", value: "3.5 Ton" },
      { icon: "Clock", label: "Müdahale", value: "Hızlı" },
      { icon: "ShieldCheck", label: "Kasko", value: "Var" },
    ],
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    category: "Ağır Ticari",
    title: "Devler Yolda Kalmaz.",
    description: "Tır, Kamyon ve Otobüs filoları için ağır hizmet kurtarıcılarımızla lojistik operasyonlarınız kesintisiz sürsün.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1920&auto=format&fit=crop",
    color: "slate",
    stats: [
      { icon: "MapPin", label: "Kapsama", value: "Tüm TR" },
      { icon: "Users", label: "Filo Referans", value: "500+" },
      { icon: "Activity", label: "Tonaj", value: "40 Ton" },
    ],
    order: 4,
    isActive: true,
  },
  {
    id: "5",
    category: "İkame Araç",
    title: "Aracınız Servisteyken Konforunuz Sürsün.",
    description: "Kaza veya arıza durumunda aracınız servisteyken size en uygun ikame aracı anında tahsis ediyoruz.",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1920&auto=format&fit=crop",
    color: "violet",
    stats: [
      { icon: "Car", label: "Araç Filosu", value: "5000+" },
      { icon: "Clock", label: "Teslimat", value: "Anında" },
      { icon: "ShieldCheck", label: "Kasko", value: "Full" },
    ],
    order: 5,
    isActive: true,
  },
  {
    id: "6",
    category: "Moto Karavan",
    title: "Tatil Keyfiniz Yarıda Kalmasın.",
    description: "Karavan tutkunlarına özel yol yardım. Tatil rotanız neresi olursa olsun, BGC Assist orada.",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1920&auto=format&fit=crop",
    color: "amber",
    stats: [
      { icon: "MapPin", label: "Bölge", value: "Tüm Kıyılar" },
      { icon: "Activity", label: "Çekici Tipi", value: "Özel" },
      { icon: "Star", label: "Puan", value: "5.0" },
    ],
    order: 6,
    isActive: true,
  },
];

// Car brands with slug for logo API
const carBrands = [
  { name: "Ford", slug: "ford" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Mercedes", slug: "mercedes-benz" },
  { name: "BMW", slug: "bmw" },
  { name: "Toyota", slug: "toyota" },
  { name: "Renault", slug: "renault" },
  { name: "Fiat", slug: "fiat" },
  { name: "Honda", slug: "honda" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Volvo", slug: "volvo" },
  { name: "Audi", slug: "audi" },
  { name: "Kia", slug: "kia" },
  { name: "Tesla", slug: "tesla" },
  { name: "Nissan", slug: "nissan" },
];

export function HeroSection() {
  const { openModal } = usePurchaseModal();
  // İlk önce static sliders ile başlat, hemen göster
  const [slides, setSlides] = useState<Slider[]>(staticSliders);

  useEffect(() => {
    // Arka planda API'den veri çek, loading state gösterme
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/sliders?active=true");
      if (res.ok) {
        const data = await res.json();
        // If API returns data, use it; otherwise keep static sliders
        if (data && data.length > 0) {
          setSlides(data); // API'den gelen verileri göster
        }
        // Eğer boşsa, static sliders kalır (zaten başlangıçta set edildi)
      }
      // Hata durumunda da static sliders kalır (zaten başlangıçta set edildi)
    } catch (err) {
      // Hata durumunda static sliders kalır (zaten başlangıçta set edildi)
      console.error("Error fetching sliders, using static:", err);
    }
  };

  const handleApplyClick = (category: string) => {
    const pkg = getPackageByCategory(category);
    if (pkg) {
      openModal(pkg);
    }
  };

  const handleScrollToStats = () => {
    const statsSection = document.getElementById('stats');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative">
      {/* Logo - Slider içine gömülü */}
      <div className="absolute top-4 left-16 lg:top-6 lg:left-24 z-50">
        <Link href="/" className="flex items-center group">
          <div className="relative h-12 md:h-14 lg:h-16 w-auto flex items-center">
            <Image
              src="/logos/logo-assist.png"
              alt="BGCAssist Logo"
              width={0}
              height={0}
              sizes="(max-width: 768px) 120px, 160px"
              loading="eager"
              priority
              className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              style={{
                // Şeffaf arka planlı logo için sadeleştirilmiş stil
                filter: 'brightness(1.05) contrast(1.1)',
              }}
            />
          </div>
        </Link>
      </div>

      {/* Swiper Slider */}
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        loop={true}
        className="h-[100vh] min-h-[600px] sm:min-h-[700px]"
      >
        {slides.map((slide) => {
          const colors = colorMap[slide.color] || colorMap.blue;
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />

                {/* Dark Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-brand-black/30" />

                {/* Content */}
                <div className="relative h-full flex items-center pt-20">
                  <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="max-w-3xl"
                    >
                      {/* Category Badge */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className={`inline-flex items-center gap-2 ${colors.bg}/20 border ${colors.border}/30 rounded-full px-4 py-2 mb-6`}
                      >
                        <Car className={`w-4 h-4 ${colors.text}`} />
                        <span className={`${colors.text} font-medium text-sm`}>{slide.category}</span>
                      </motion.div>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-brand-white mb-6 leading-[1.1]">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl lg:text-2xl text-brand-white/80 mb-10 leading-relaxed max-w-2xl">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          size="lg"
                          className={`${colors.bg} hover:bg-white hover:text-brand-black text-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold shadow-lg min-h-[44px] touch-manipulation transition-all duration-300`}
                          onClick={() => handleApplyClick(slide.category)}
                        >
                          Hemen Başvur
                          <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 border-brand-white bg-brand-white/10 text-brand-white hover:bg-brand-white hover:text-brand-black text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold backdrop-blur-md min-h-[44px] touch-manipulation"
                        >
                          Detaylı Bilgi
                        </Button>
                      </div>

                    </motion.div>
                  </div>

                  {/* Car Brands Marquee - Full Width at Bottom */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-20 left-0 w-full z-20 py-4 bg-gradient-to-r from-transparent via-brand-black/20 to-transparent backdrop-blur-[2px]"
                  >
                    <div className="relative overflow-hidden">
                      {/* Gradient overlays for fade effect */}
                      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-black/40 to-transparent z-10" />
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-black/40 to-transparent z-10" />

                      <div className="flex animate-marquee items-center whitespace-nowrap group">
                        {/* First set of logos */}
                        {carBrands.map((brand, index) => (
                          <div
                            key={`slider-full-first-${index}`}
                            className="flex-shrink-0 mx-10 lg:mx-14 flex items-center justify-center"
                            title={brand.name}
                          >
                            <img
                              src={`https://www.carlogos.org/car-logos/${brand.slug}-logo.png`}
                              alt={brand.name}
                              className="h-10 lg:h-12 w-auto object-contain opacity-80 brightness-[2.5] grayscale contrast-150 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:grayscale-0 hover:brightness-100 hover:contrast-100 hover:scale-110 hover:opacity-100 transition-all duration-300 cursor-pointer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {carBrands.map((brand, index) => (
                          <div
                            key={`slider-full-second-${index}`}
                            className="flex-shrink-0 mx-10 lg:mx-14 flex items-center justify-center"
                            title={brand.name}
                          >
                            <img
                              src={`https://www.carlogos.org/car-logos/${brand.slug}-logo.png`}
                              alt={brand.name}
                              className="h-10 lg:h-12 w-auto object-contain opacity-80 brightness-[2.5] grayscale contrast-150 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:grayscale-0 hover:brightness-100 hover:contrast-100 hover:scale-110 hover:opacity-100 transition-all duration-300 cursor-pointer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Keşfet Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          onClick={handleScrollToStats}
          className="flex flex-col items-center gap-1 text-brand-white/70 hover:text-brand-white transition-colors group scale-90 md:scale-100"
          aria-label="Keşfet"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Keşfet</span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:animate-none" />
        </motion.button>
      </div>
    </section>
  );
}
