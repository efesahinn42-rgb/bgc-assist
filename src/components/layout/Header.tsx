"use client";

import Link from "next/link";
import { Phone, Menu, X, User, AlertTriangle, Home, Wrench, Package, Info, Mail, ChevronDown, FileText, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/lib/settings-context";

const navLinks = [
  { href: "/", label: "Anasayfa", icon: Home },
  { href: "#services", label: "Hizmetler", icon: Wrench },
  { href: "#packages", label: "Paketler", icon: Package },
  { href: "#about", label: "Hakkımızda", icon: Info },
  { href: "#contact", label: "İletişim", icon: Mail },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  // Format phone for tel: links (remove spaces)
  const phoneLink = settings.phone.replace(/\s/g, "");

  // Hasar İhbar Hattı phone number (hardcoded)
  const hasarIhbarPhone = "0850 242 0 155";
  const hasarIhbarLink = hasarIhbarPhone.replace(/\s/g, "");

  // Yardım Al phone number (hardcoded)
  const yardimAlPhone = "0850 888 0 155";
  const yardimAlLink = yardimAlPhone.replace(/\s/g, "");

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);


  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's the home page link and we're already on home, scroll to top
    if (href === "/") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsMenuOpen(false);
      }
      // Otherwise, let Next.js Link handle navigation
      return;
    }

    // Handle hash links (#services, #packages, etc.)
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);

      // If we're on the home page, scroll to the element
      if (window.location.pathname === "/") {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          setIsMenuOpen(false);
        }
      } else {
        // If we're on a different page, navigate to home with hash
        window.location.href = `/${href}`;
      }
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-brand-black/95 backdrop-blur-md shadow-lg py-2"
        : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo placeholder - Logo artık slider içinde */}
          <div className="h-14 md:h-16 w-auto"></div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 ml-40">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-brand-white/90 hover:text-brand-red transition-colors font-medium relative group flex items-center gap-2"
                  aria-label={link.label}
                >
                  <Icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}

            {/* Başvuru Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-brand-white/90 hover:text-brand-red transition-colors font-medium relative group flex items-center gap-1"
              >
                <FileText className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                Başvuru
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-hover:w-full" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-brand-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden"
                  >
                    <Link
                      href="/acente-basvuru"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-brand-white/90 hover:text-brand-red hover:bg-white/5 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      <div>
                        <span className="font-medium block">Bayilik Başvurusu</span>
                        <span className="text-xs text-white/50">Bayilik ağımıza katılın</span>
                      </div>
                    </Link>
                    <Link
                      href="/tedarikci-basvuru"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-brand-white/90 hover:text-brand-red hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      <Building2 className="w-5 h-5" />
                      <div>
                        <span className="font-medium block">Tedarikçi Başvurusu</span>
                        <span className="text-xs text-white/50">Tedarikçi ağımıza katılın</span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* CTA Section */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href={`tel:+90${phoneLink}`}
              className="flex items-center gap-2 text-brand-white group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center group-hover:bg-brand-red transition-colors">
                <Phone className="w-5 h-5 text-brand-red group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-brand-white/60">Hemen Ara</span>
                <span className="font-bold text-brand-white">{settings.phone}</span>
              </div>
            </a>
            <a
              href={`tel:+90${hasarIhbarLink}`}
              className="flex items-center gap-2 text-brand-white group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <AlertTriangle className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-brand-white/60">Hasar İhbar Hattı</span>
                <span className="font-bold text-brand-white">{hasarIhbarPhone}</span>
              </div>
            </a>
            <a
              href={`tel:+90${yardimAlLink}`}
              className="bg-brand-red hover:bg-brand-red-dark text-brand-white px-5 py-2.5 text-sm font-semibold cursor-pointer rounded-lg transition-colors inline-flex items-center justify-center min-h-[44px]"
            >
              Yardım Al
            </a>
            <Link href="https://bgcassist.sistempartner.com/Account/Login" target="_blank" rel="noopener noreferrer">
              <Button
                className="bg-brand-black/50 border border-brand-white/40 text-brand-white hover:bg-brand-black/70 hover:border-brand-white px-5 py-2.5 text-sm font-semibold backdrop-blur-sm cursor-pointer min-h-[44px]"
              >
                <User className="w-4 h-4 mr-2" />
                Bayi Girişi
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-brand-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-16 z-40 bg-brand-black/98 backdrop-blur-md overflow-y-auto"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2 max-h-[calc(100vh-4rem)]">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        handleNavClick(e, link.href);
                        setIsMenuOpen(false);
                      }}
                      className="text-brand-white/90 hover:text-brand-red transition-colors font-medium py-3 block border-b border-brand-white/10 flex items-center gap-3"
                      aria-label={link.label}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Başvuru Links for Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="border-b border-brand-white/10"
              >
                <p className="text-brand-white/50 text-sm py-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Başvuru
                </p>
                <Link
                  href="/acente-basvuru"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-brand-white/90 hover:text-brand-red transition-colors font-medium py-3 block flex items-center gap-3 pl-6"
                >
                  <Users className="w-5 h-5" />
                  Bayilik Başvurusu
                </Link>
                <Link
                  href="/tedarikci-basvuru"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-brand-white/90 hover:text-brand-red transition-colors font-medium py-3 block flex items-center gap-3 pl-6"
                >
                  <Building2 className="w-5 h-5" />
                  Tedarikçi Başvurusu
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-4 pb-6 space-y-4"
              >
                <a
                  href={`tel:+90${phoneLink}`}
                  className="flex items-center gap-3 text-brand-white"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand-red" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-brand-white/60">Hemen Ara</span>
                    <span className="font-bold text-lg">{settings.phone}</span>
                  </div>
                </a>
                <a
                  href={`tel:+90${hasarIhbarLink}`}
                  className="flex items-center gap-3 text-brand-white"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-brand-white/60">Hasar İhbar Hattı</span>
                    <span className="font-bold text-lg">{hasarIhbarPhone}</span>
                  </div>
                </a>
                <a
                  href={`tel:+90${yardimAlLink}`}
                  className="bg-brand-red hover:bg-brand-red-dark text-brand-white w-full py-6 text-lg font-semibold cursor-pointer rounded-lg transition-colors inline-flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Yardım Al
                </a>
                <Link href="https://bgcassist.sistempartner.com/Account/Login" target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    className="bg-brand-black/50 border border-brand-white/40 text-brand-white hover:bg-brand-black/70 hover:border-brand-white w-full py-6 text-lg font-semibold backdrop-blur-sm cursor-pointer"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Bayi Girişi
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
