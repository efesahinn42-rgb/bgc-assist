"use client";

import { motion } from "framer-motion";
import { Clock, Users, MapPin, Shield, Headphones, Award, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Hızlı Müdahale",
    description: "Ortalama 15 dakika içinde olay yerine ulaşıyoruz. Gecikme yok, bekleme yok.",
    highlight: "15 dk",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Gece gündüz, hafta sonu veya tatil günü fark etmez. Her zaman ulaşılabilir durumdayız.",
    highlight: "7/24",
  },
  {
    icon: Users,
    title: "Uzman Ekip",
    description: "Deneyimli ve eğitimli teknisyenlerimiz her türlü arıza için hazır.",
    highlight: "500+",
  },
  {
    icon: MapPin,
    title: "Türkiye Geneli",
    description: "81 ilde yaygın hizmet ağımızla nerede olursanız olun yanınızdayız.",
    highlight: "81 İl",
  },
];

const additionalFeatures = [
  { icon: Shield, text: "Güvenli Hizmet" },
  { icon: Award, text: "Kalite Garantisi" },
  { icon: Heart, text: "Müşteri Memnuniyeti" },
  { icon: Clock, text: "Dakik Hizmet" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
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

export function FeaturesSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-brand-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-brand-red/10 text-brand-red px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Neden Biz?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-black mb-6">
            Neden <span className="text-brand-red">BGCAssist</span>'i Seçmelisiniz?
          </h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Yılların deneyimi ve müşteri odaklı yaklaşımımızla yol yardım hizmetlerinde fark yaratıyoruz.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <div className="bg-brand-white rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-red/20 relative overflow-hidden">
                  {/* Highlight Badge */}
                  <div className="absolute top-4 right-4 bg-brand-red text-brand-white text-xs font-bold px-3 py-1 rounded-full">
                    {feature.highlight}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-brand-red/10 flex items-center justify-center mb-6 group-hover:bg-brand-red group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-brand-red group-hover:text-brand-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-brand-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-brand-gray leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Features Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-brand-black rounded-2xl p-8 lg:p-10"
        >
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            {additionalFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-red" />
                  </div>
                  <span className="text-brand-white font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
