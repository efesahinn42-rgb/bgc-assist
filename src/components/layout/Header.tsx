"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDefaultPackage } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";
import { useSettings } from "@/lib/settings-context";

const navLinks = [
  { href: "#services", label: "Hizmetler" },
  { href: "#packages", label: "Paketler" },
  { href: "#about", label: "Hakkımızda" },
  { href: "#contact", label: "İletişim" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openModal } = usePurchaseModal();
  const { settings } = useSettings();

  // Format phone for tel: links (remove spaces)
  const phoneLink = settings.phone.replace(/\s/g, "");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleYardimAlClick = () => {
    const defaultPackage = getDefaultPackage();
    openModal(defaultPackage);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-black/95 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-4"
      }`}
      style={{ top: isScrolled ? 0 : "36px" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-14 md:h-16 w-auto flex items-center">
              <Image
                src="/logo.png"
                alt="BGCAssist Logo"
                width={0}
                height={0}
                sizes="(max-width: 768px) 160px, 200px"
                className="h-14 md:h-16 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-white/90 hover:text-brand-red transition-colors font-medium relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA Section */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href={`tel:+90${phoneLink}`}
              className="flex items-center gap-2 text-brand-white group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center group-hover:bg-brand-red transition-colors">
                <Phone className="w-5 h-5 text-brand-red group-hover:text-brand-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-brand-white/60">Hemen Ara</span>
                <span className="font-bold text-brand-white">{settings.phone}</span>
              </div>
            </a>
            <Button 
              className="bg-brand-red hover:bg-brand-red-dark text-brand-white px-6 py-5 text-base font-semibold"
              onClick={handleYardimAlClick}
            >
              Yardım Al
            </Button>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-brand-black/98 backdrop-blur-md border-t border-brand-white/10"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-brand-white/90 hover:text-brand-red transition-colors font-medium py-3 block border-b border-brand-white/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-4 space-y-4"
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
                <Button 
                  className="bg-brand-red hover:bg-brand-red-dark text-brand-white w-full py-6 text-lg font-semibold"
                  onClick={handleYardimAlClick}
                >
                  Yardım Al
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
