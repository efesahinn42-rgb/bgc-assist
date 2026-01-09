"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings-context";

const quickLinks = [
  { href: "#services", label: "Hizmetlerimiz" },
  { href: "#packages", label: "Paketler" },
  { href: "#about", label: "Hakkımızda" },
  { href: "#contact", label: "İletişim" },
  { href: "/bayi-girisi", label: "Bayi Girişi" },
  { href: "/sss", label: "Sık Sorulan Sorular" },
];

const services = [
  "Çekici Hizmeti",
  "Akü Takviye",
  "Lastik Değişimi",
  "Yakıt İkmali",
  "Anahtar Hizmeti",
  "Yerinde Onarım",
];

const legalLinks = [
  { href: "/gizlilik", label: "Gizlilik Politikası" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/cerezler", label: "Çerez Politikası" },
];

export function Footer() {
  const { settings } = useSettings();

  // Build social links from settings
  const socialLinks = [
    { icon: Facebook, href: settings.facebook, label: "Facebook" },
    { icon: Instagram, href: settings.instagram, label: "Instagram" },
    { icon: Twitter, href: settings.twitter, label: "Twitter" },
    { icon: Linkedin, href: settings.linkedin, label: "LinkedIn" },
  ].filter(link => link.href); // Only show links that have URLs

  // Format phone for tel: link
  const phoneLink = settings.phone.replace(/\s/g, "");

  return (
    <footer id="contact" className="bg-brand-black text-brand-white">
      {/* Newsletter Section */}
      <div className="border-b border-brand-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Güncel Kalın</h3>
              <p className="text-brand-white/60">Kampanyalardan ve yeniliklerden haberdar olun.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="px-5 py-3 rounded-lg bg-brand-white/10 border border-brand-white/20 text-brand-white placeholder:text-brand-white/40 focus:outline-none focus:border-brand-red w-full sm:w-80"
              />
              <Button className="bg-brand-red hover:bg-brand-red-dark text-brand-white px-6 py-3 font-semibold whitespace-nowrap">
                Abone Ol
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center">
              <div className="relative h-12 w-auto flex items-center">
                <Image
                  src="/logo.png"
                  alt="BGCAssist Logo"
                  width={0}
                  height={0}
                  sizes="200px"
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-brand-white/60 leading-relaxed">
              Türkiye&apos;nin en güvenilir yol yardım hizmeti. 7/24 kesintisiz hizmet anlayışıyla her zaman yanınızdayız.
            </p>
            
            {/* Working Hours Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-red/20 rounded-lg px-4 py-3">
              <Clock className="w-5 h-5 text-brand-red" />
              <span className="font-semibold">{settings.workingHours}</span>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-brand-white/10 flex items-center justify-center hover:bg-brand-red transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-lg font-bold mb-6">Hızlı Bağlantılar</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-white/60 hover:text-brand-red transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-lg font-bold mb-6">Hizmetlerimiz</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-brand-white/60 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-bold mb-6">İletişim</h4>
            <div className="space-y-4">
              <a
                href={`tel:+90${phoneLink}`}
                className="flex items-start gap-3 text-brand-white/60 hover:text-brand-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-red/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red transition-colors">
                  <Phone className="w-5 h-5 text-brand-red group-hover:text-brand-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs text-brand-white/40 mb-1">Çağrı Merkezi</div>
                  <div className="font-semibold text-brand-white">{settings.phone}</div>
                </div>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="flex items-start gap-3 text-brand-white/60 hover:text-brand-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-red/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red transition-colors">
                  <Mail className="w-5 h-5 text-brand-red group-hover:text-brand-white transition-colors" />
                </div>
                <div>
                  <div className="text-xs text-brand-white/40 mb-1">E-posta</div>
                  <div className="font-semibold text-brand-white">{settings.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-3 text-brand-white/60">
                <div className="w-10 h-10 rounded-lg bg-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <div className="text-xs text-brand-white/40 mb-1">Adres</div>
                  <div className="text-brand-white/80">
                    {settings.address}
                  </div>
                  <div className="text-brand-white/60 text-sm mt-1">
                    İl: {settings.city}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brand-white/50 text-sm text-center md:text-left">
              © {new Date().getFullYear()} BGCAssist. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-brand-white/50 hover:text-brand-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
