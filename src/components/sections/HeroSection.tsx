"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck, Clock, MapPin, Users, Star, Activity, Car } from "lucide-react";
import { getPackageByCategory } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";

// Swiper CSS imports
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    category: "Otomobil",
    title: "Yolda Kalmak Yok, Devam Etmek Var.",
    desc: "Binek araçlarınız için 7/24 çekici, yerinde akü ve lastik değişimi hizmeti. Ailenizle güvenle seyahat edin.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop",
    color: "blue",
    stats: [
      { icon: Clock, label: "Ort. Varış", value: "18 Dk" },
      { icon: MapPin, label: "Hizmet Ağı", value: "81 İl" },
      { icon: Users, label: "Mutlu Müşteri", value: "10K+" },
    ],
  },
  {
    id: 2,
    category: "Motosiklet",
    title: "İki Teker Özgürlüktür, Biz Güvencesiyiz.",
    desc: "Motosikletlere özel aparatlı çekicilerimizle, motorunuzu çizmeden, devirmeden güvenle taşıyoruz.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop",
    color: "orange",
    stats: [
      { icon: ShieldCheck, label: "Güvenlik", value: "%100" },
      { icon: Star, label: "Memnuniyet", value: "4.9/5" },
      { icon: Activity, label: "Operasyon", value: "7/24" },
    ],
  },
  {
    id: 3,
    category: "Hafif Ticari",
    title: "Esnafın Yükünü Hafifletiyoruz.",
    desc: "Doblo, Transporter ve Panelvan araçlarınız arızalandığında işiniz aksamasın. Hızlı müdahale ekibi hazır.",
    image: "https://images.unsplash.com/photo-1656426650699-a76ffe479608?q=80&w=1920&auto=format&fit=crop",
    color: "emerald",
    stats: [
      { icon: Activity, label: "Yük Kapasitesi", value: "3.5 Ton" },
      { icon: Clock, label: "Müdahale", value: "Hızlı" },
      { icon: ShieldCheck, label: "Kasko", value: "Var" },
    ],
  },
  {
    id: 4,
    category: "Ağır Ticari",
    title: "Devler Yolda Kalmaz.",
    desc: "Tır, Kamyon ve Otobüs filoları için ağır hizmet kurtarıcılarımızla lojistik operasyonlarınız kesintisiz sürsün.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1920&auto=format&fit=crop",
    color: "slate",
    stats: [
      { icon: MapPin, label: "Kapsama", value: "Tüm TR" },
      { icon: Users, label: "Filo Referans", value: "500+" },
      { icon: Activity, label: "Tonaj", value: "40 Ton" },
    ],
  },
  {
    id: 5,
    category: "İkame Araç",
    title: "Aracınız Servisteyken Konforunuz Sürsün.",
    desc: "Kaza veya arıza durumunda aracınız servisteyken size en uygun ikame aracı anında tahsis ediyoruz.",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1920&auto=format&fit=crop",
    color: "violet",
    stats: [
      { icon: Car, label: "Araç Filosu", value: "5000+" },
      { icon: Clock, label: "Teslimat", value: "Anında" },
      { icon: ShieldCheck, label: "Kasko", value: "Full" },
    ],
  },
  {
    id: 6,
    category: "Moto Karavan",
    title: "Tatil Keyfiniz Yarıda Kalmasın.",
    desc: "Karavan tutkunlarına özel yol yardım. Tatil rotanız neresi olursa olsun, BGC Assist orada.",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1920&auto=format&fit=crop",
    color: "amber",
    stats: [
      { icon: MapPin, label: "Bölge", value: "Tüm Kıyılar" },
      { icon: Activity, label: "Çekici Tipi", value: "Özel" },
      { icon: Star, label: "Puan", value: "5.0" },
    ],
  },
];

// Color mapping for categories
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500" },
  slate: { bg: "bg-slate-500", text: "text-slate-500", border: "border-slate-500" },
  violet: { bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
};

// Car brands with slug for logo API
const carBrands = [
  { name: "Ford", slug: "ford" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Mercedes", slug: "mercedes" },
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

  const handleApplyClick = (category: string) => {
    const pkg = getPackageByCategory(category);
    if (pkg) {
      openModal(pkg);
    }
  };

  return (
    <section className="relative">
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
                        {slide.desc}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className={`${colors.bg} hover:opacity-90 text-white text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 font-semibold shadow-lg min-h-[44px] touch-manipulation`}
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

                      {/* Dynamic Stats */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex flex-wrap items-center gap-6 lg:gap-8 mt-12 pt-8 border-t border-brand-white/10"
                      >
                        {slide.stats.map((stat, statIndex) => {
                          const StatIcon = stat.icon;
                          return (
                            <div key={statIndex} className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl ${colors.bg}/20 flex items-center justify-center`}>
                                <StatIcon className={`w-6 h-6 ${colors.text}`} />
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-brand-white">{stat.value}</div>
                                <div className="text-sm text-brand-white/60">{stat.label}</div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Car Brands Marquee */}
      <div className="relative z-20 -mt-16 lg:-mt-20">
        <div className="bg-gradient-to-b from-slate-100 via-stone-100 to-gray-100 py-12 lg:py-16 relative overflow-hidden">
          {/* Subtle Dot Pattern */}
          <div className="absolute inset-0 opacity-[0.5]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(220, 38, 38, 0.06) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }} />
          </div>
          
          {/* Decorative line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
          
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-center text-brand-gray text-sm mb-8 font-medium uppercase tracking-widest">
                Tüm Araç Markalarına Hizmet Veriyoruz
              </p>
            </motion.div>
          </div>
          
          <div className="relative overflow-hidden py-6">
            {/* Gradient overlays for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 lg:w-48 bg-gradient-to-r from-stone-100 via-stone-100/80 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 lg:w-48 bg-gradient-to-l from-stone-100 via-stone-100/80 to-transparent z-10" />
            
            {/* Scrolling container */}
            <div className="flex animate-marquee items-center">
              {/* First set of logos */}
              {carBrands.map((brand, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center group"
                  title={brand.name}
                >
                  <img
                    src={`https://www.carlogos.org/car-logos/${brand.slug}-logo.png`}
                    alt={brand.name}
                    className="h-10 lg:h-14 w-auto object-contain opacity-50 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {carBrands.map((brand, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center group"
                  title={brand.name}
                >
                  <img
                    src={`https://www.carlogos.org/car-logos/${brand.slug}-logo.png`}
                    alt={brand.name}
                    className="h-10 lg:h-14 w-auto object-contain opacity-50 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
