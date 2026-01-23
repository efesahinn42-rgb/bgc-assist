"use client";

import CountUp from "react-countup";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Users, Car, Clock, MapPin, Package, MessageCircle, HelpCircle, Phone, ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/lib/settings-context";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Mutlu Müşteri",
    description: "Her yıl artan memnuniyet",
  },
  {
    icon: Car,
    value: 100000,
    suffix: "+",
    label: "Tamamlanan Hizmet",
    description: "Başarılı operasyon",
  },
  {
    icon: Clock,
    value: 15,
    suffix: "",
    label: "Dakika Ortalama Varış",
    description: "Hızlı müdahale süresi",
  },
  {
    icon: MapPin,
    value: 81,
    suffix: "",
    label: "İlde Hizmet",
    description: "Türkiye geneli kapsama",
  },
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

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const actionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { settings } = useSettings();

  // Yardım Talep Et phone number (hardcoded)
  const yardimTalepPhone = "0850 242 0 155";
  const yardimTalepLink = yardimTalepPhone.replace(/\s/g, "");

  // Quick actions with dynamic WhatsApp link
  const quickActions = [
    {
      icon: Package,
      title: "Paket Satın Al",
      description: "Avantajlı paketleri keşfedin",
      href: "#packages",
      color: "bg-blue-500",
      external: false,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp ile Ulaşın",
      description: "Hızlı destek için yazın",
      href: `https://wa.me/${settings.whatsapp}?text=Merhaba,%20yol%20yard%C4%B1m%C4%B1%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`,
      color: "bg-emerald-500",
      external: true,
    },
    {
      icon: HelpCircle,
      title: "Yardım Talep Et",
      description: "Acil yol yardımı çağırın",
      href: `tel:+90${yardimTalepLink}`,
      color: "bg-amber-500",
      external: true,
    },
    {
      icon: Phone,
      title: "Bize Ulaşın",
      description: "7/24 müşteri hizmetleri",
      href: "#contact",
      color: "bg-purple-500",
      external: false,
    },
  ];

  const handleScrollToServices = () => {
    const servicesDevamEtButton = document.getElementById('services-devam-et');
    if (servicesDevamEtButton) {
      servicesDevamEtButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="stats" ref={ref} className="py-24 lg:py-32 relative overflow-hidden bg-[#030303] text-white">
      {/* Background Shapes & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />

      {/* Soft gradient orbs */}
      <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-100/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tl from-orange-100/50 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Quick Action Cards */}
        <motion.div
          variants={actionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-20"
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <a
                  href={action.href}
                  className="block h-full"
                  suppressHydrationWarning
                  {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden rounded-xl" suppressHydrationWarning>
                    <CardContent className="p-0 relative" suppressHydrationWarning>
                      {/* Colored top bar */}
                      <div className={`h-1 ${action.color}`} suppressHydrationWarning />

                      <div className="p-5 lg:p-6 flex flex-col items-center text-center" suppressHydrationWarning>
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/20`} suppressHydrationWarning>
                          <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-white text-base lg:text-lg mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs text-white/50 hidden sm:block">
                          {action.description}
                        </p>

                        {/* Arrow indicator */}
                        <div className="mt-3 flex items-center gap-1 text-brand-red font-medium group-hover:gap-2 transition-all duration-300" suppressHydrationWarning>
                          <span className="text-xs">Keşfet</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-red/20 to-rose-500/20 text-brand-red px-5 py-2.5 rounded-full text-sm font-bold mb-8 border border-brand-red/30 backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.15)] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
            Rakamlarla
          </span>
          <h2 className="flex flex-col items-center justify-center gap-4 text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8 tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              Neden
            </span>
            <div className="relative h-12 md:h-16 lg:h-20 w-48 md:w-64 lg:w-80">
              <Image
                src="/logos/logo-assist.png"
                alt="BGC Assist Logo"
                fill
                className="object-contain brightness-110 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                priority
              />
            </div>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto leading-relaxed text-lg font-light">
            Yılların deneyimi ve binlerce müşterinin güveni ile hizmetinizdeyiz.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-red/20">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                    {isInView ? (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        suffix={stat.suffix}
                        separator="."
                      />
                    ) : (
                      <span>0{stat.suffix}</span>
                    )}
                  </div>
                  <div className="text-white/90 font-bold mb-1 tracking-wide">{stat.label}</div>
                  <p className="text-white/40 text-sm font-light">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Devam Et Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-16"
        >
          <button
            onClick={handleScrollToServices}
            className="bg-brand-red hover:bg-brand-red-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Devam Et"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
