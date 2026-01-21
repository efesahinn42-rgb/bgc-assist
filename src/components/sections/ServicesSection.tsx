"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Battery, Disc, Fuel, Key, Wrench, ChevronRight, ChevronDown, X, Check, Clock, Phone } from "lucide-react";
import { useSettings } from "@/lib/settings-context";

const services = [
  {
    icon: Truck,
    title: "Çekici Hizmeti",
    description: "Aracınızı güvenle istediğiniz noktaya taşıyoruz. En modern çekici filomuz ile her türlü araç için hizmet.",
    color: "bg-blue-500",
    image: "https://images.unsplash.com/photo-1742069029207-0aacf8fa4401?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Aracınız arızalandığında veya kaza yaptığında, profesyonel çekici filomuz ile güvenli bir şekilde istediğiniz noktaya taşıyoruz. Hafif ticari araçlardan ağır vasıtalara kadar her türlü araç için özel ekipmanlarımız mevcuttur.",
      features: [
        "7/24 kesintisiz hizmet",
        "Tüm Türkiye'de geçerli",
        "Profesyonel sürücüler",
        "Sigortalı taşımacılık",
        "GPS takipli filomuz",
        "Acil durum önceliği"
      ],
      responseTime: "Ortalama 15-20 dakika",
      coverage: "81 ilde hizmet"
    }
  },
  {
    icon: Battery,
    title: "Akü Takviye",
    description: "Akünüz bittiğinde dakikalar içinde yanınızdayız. Profesyonel ekipmanlarla güvenli takviye.",
    color: "bg-emerald-500",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Soğuk kış günlerinde veya uzun süre kullanılmayan araçlarda akü bitmeleri sık yaşanır. Profesyonel ekipmanlarımız ve uzman teknisyenlerimizle aracınızın akü sorununu yerinde çözüyoruz.",
      features: [
        "Yerinde akü takviyesi",
        "Akü test ve kontrol",
        "Yeni akü satış ve montaj",
        "Tüm marka araçlara uyumlu",
        "Profesyonel ekipman",
        "Hızlı müdahale"
      ],
      responseTime: "Ortalama 10-15 dakika",
      coverage: "Şehir içi öncelikli"
    }
  },
  {
    icon: Disc,
    title: "Lastik Değişimi",
    description: "Lastik patlaması durumunda hızlı yedek lastik değişimi. Yolda kalmayın, biz geliyoruz.",
    color: "bg-amber-500",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Yolda lastik patlaması veya delinmesi durumunda panik yapmayın. Uzman ekibimiz hızlıca yanınıza gelerek yedek lastik montajını gerçekleştirir veya gerekirse en yakın lastikçiye çekici ile ulaştırır.",
      features: [
        "Stepne montajı",
        "Lastik tamiri",
        "Lastik basınç kontrolü",
        "Bijon sıkma kontrolü",
        "Yedek lastik temini",
        "Lastikçiye çekici hizmeti"
      ],
      responseTime: "Ortalama 15-20 dakika",
      coverage: "Otoyol dahil tüm yollar"
    }
  },
  {
    icon: Fuel,
    title: "Yakıt İkmali",
    description: "Yakıtınız bittiğinde acil yakıt teslimatı. Benzin veya dizel, anında ulaştırıyoruz.",
    color: "bg-purple-500",
    image: "https://images.unsplash.com/photo-1629241290025-6bb716261f5f?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Yolda yakıtınız bittiyse endişelenmeyin. Benzin veya dizel farketmeksizin, aracınıza en yakın istasyona ulaşmanızı sağlayacak miktarda yakıt ikmali yapıyoruz.",
      features: [
        "Benzin ve dizel teslimatı",
        "Güvenli yakıt transferi",
        "Minimum 5 litre teslimat",
        "Fatura kesimi",
        "7/24 hizmet",
        "Tüm araç tiplerine uygun"
      ],
      responseTime: "Ortalama 20-25 dakika",
      coverage: "Şehir içi ve çevre yolları"
    }
  },
  {
    icon: Key,
    title: "Anahtar Hizmeti",
    description: "Araç içinde kalan anahtarlar için çilingir hizmeti. Hasarsız kapı açma garantisi.",
    color: "bg-pink-500",
    image: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Araç anahtarınız içeride kaldıysa veya kaybettiyseniz, uzman çilingir ekibimiz hasarsız kapı açma garantisi ile hizmetinizdedir. Tüm marka ve modeller için çözüm sunuyoruz.",
      features: [
        "Hasarsız kapı açma",
        "Immobilizer programlama",
        "Yedek anahtar yapımı",
        "Sustalı anahtar tamiri",
        "Kontak tamiri",
        "Tüm marka araçlara hizmet"
      ],
      responseTime: "Ortalama 15-25 dakika",
      coverage: "Şehir içi öncelikli"
    }
  },
  {
    icon: Wrench,
    title: "Yerinde Onarım",
    description: "Basit arızalar için yerinde teknik destek. Uzman teknisyenlerimiz hemen müdahale eder.",
    color: "bg-cyan-500",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop",
    detailedInfo: {
      longDescription: "Küçük arızalar için servise gitmenize gerek yok. Mobil servis ekibimiz bulunduğunuz yere gelerek basit arızaları yerinde onarır. Kayış kopması, soğutma sıvısı eksikliği gibi sorunlar anında çözülür.",
      features: [
        "Mobil servis ekibi",
        "Temel arıza tespiti",
        "Kayış değişimi",
        "Sıvı ikmalleri",
        "Sigorta değişimi",
        "Teşhis cihazı ile kontrol"
      ],
      responseTime: "Ortalama 20-30 dakika",
      coverage: "Şehir içi sınırlı"
    }
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export function ServicesSection() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const { settings } = useSettings();

  // ServicesSection phone number is hardcoded (not from settings)
  const servicesPhone = "0850 242 0 155";
  const phoneLink = servicesPhone.replace(/\s/g, "");

  const handleScrollToPackages = () => {
    const packagesSection = document.getElementById('packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="services" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Warm Gray Gradient Background - slightly darker than StatsSection */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-gray-100 to-slate-100" />
      
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
      <div className="absolute top-40 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-rose-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-orange-100/50 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-brand-red/10 text-brand-red px-5 py-2.5 rounded-full text-sm font-semibold mb-4 border border-brand-red/20">
            Hizmetlerimiz
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-6">
            Kapsamlı <span className="text-brand-red">Yol Yardım</span> Hizmetleri
          </h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto leading-relaxed">
            7/24 kesintisiz hizmet anlayışımızla tüm yol yardım ihtiyaçlarınızda profesyonel destek sunuyoruz.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <Card className="h-full bg-white border-0 shadow-lg shadow-stone-200/60 hover:shadow-xl hover:shadow-stone-300/60 transition-all duration-400 group hover:-translate-y-1.5 overflow-hidden rounded-2xl cursor-pointer touch-manipulation"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-0 relative">
                    {/* Colored top bar */}
                    <div className={`h-1.5 ${service.color}`} />
                    
                    <div className="p-7 lg:p-8">
                      {/* Icon with background */}
                      <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-md ${service.color.replace('bg-', 'shadow-')}/30`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-brand-black mb-3">
                        {service.title}
                      </h3>
                      <p className="text-brand-gray leading-relaxed mb-5 text-[15px]">
                        {service.description}
                      </p>
                      
                      {/* Learn more link - always visible */}
                      <div className="flex items-center gap-1.5 text-brand-red font-semibold group-hover:gap-2.5 transition-all duration-300">
                        <span className="text-sm">Detaylı Bilgi</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Devam Et Button - Below Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <button
            onClick={handleScrollToPackages}
            className="bg-brand-red hover:bg-brand-red-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Devam Et"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {/* Modal / Lightbox */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                <Image
                  src={selectedService.image}
                  alt={selectedService.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {/* Title on Image */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className={`inline-flex items-center gap-2 ${selectedService.color} rounded-full px-4 py-2 mb-3`}>
                    {(() => {
                      const Icon = selectedService.icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                    <span className="text-white font-semibold text-sm">Hizmet Detayı</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
                {/* Description */}
                <p className="text-brand-gray text-base md:text-lg leading-relaxed mb-8">
                  {selectedService.detailedInfo.longDescription}
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-brand-red" />
                      <span className="text-sm text-brand-gray">Müdahale Süresi</span>
                    </div>
                    <p className="font-bold text-brand-black">{selectedService.detailedInfo.responseTime}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-brand-red" />
                      <span className="text-sm text-brand-gray">Kapsama Alanı</span>
                    </div>
                    <p className="font-bold text-brand-black">{selectedService.detailedInfo.coverage}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-bold text-brand-black mb-4">Hizmet Özellikleri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedService.detailedInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${selectedService.color}/10 flex items-center justify-center`}>
                          <Check className={`w-4 h-4 ${selectedService.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-brand-black text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`tel:+90${phoneLink}`}
                    className={`flex-1 ${selectedService.color} hover:opacity-90 text-white py-6 font-semibold rounded-lg flex items-center justify-center transition-all duration-300`}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hemen Ara
                  </a>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white py-6 font-semibold"
                    onClick={() => setSelectedService(null)}
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Devam Et Button */}
      <motion.div
        id="services-devam-et"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-16"
      >
        <button
          onClick={handleScrollToPackages}
          className="bg-brand-red hover:bg-brand-red-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label="Devam Et"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}
