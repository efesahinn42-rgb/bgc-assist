"use client";

import { Facebook, Instagram, Twitter, Clock, User, Globe } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";

export function TopBar() {
  const { settings } = useSettings();

  // Build social links from settings
  const socialLinks = [
    { icon: Facebook, href: settings.facebook, label: "Facebook" },
    { icon: Instagram, href: settings.instagram, label: "Instagram" },
    { icon: Twitter, href: settings.twitter, label: "Twitter" },
  ].filter(link => link.href); // Only show links that have URLs

  return (
    <div className="bg-brand-black text-brand-white py-2 text-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Social Links */}
          <div className="hidden sm:flex items-center gap-3">
            {socialLinks.length > 0 ? (
              socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-white/70 hover:text-brand-red transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })
            ) : (
              <span className="text-brand-white/50 text-xs">BGCAssist</span>
            )}
          </div>

          {/* Center: Working Hours */}
          <div className="flex items-center gap-2 text-brand-white/90">
            <Clock className="w-4 h-4 text-brand-red" />
            <span className="font-medium">{settings.workingHours}</span>
          </div>

          {/* Right: Dealer Login & Language */}
          <div className="flex items-center gap-4">
            <Link
              href="/bayi-girisi"
              className="hidden sm:flex items-center gap-1.5 text-brand-white/70 hover:text-brand-red transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Bayi Girişi</span>
            </Link>
            <div className="h-4 w-px bg-brand-white/20 hidden sm:block" />
            <button className="flex items-center gap-1.5 text-brand-white/70 hover:text-brand-white transition-colors">
              <Globe className="w-4 h-4" />
              <span>TR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
