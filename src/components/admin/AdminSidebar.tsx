"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Moon,
  Sun,
  Image
} from "lucide-react";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Paketler", href: "/admin/packages" },
  { icon: Wrench, label: "Hizmetler", href: "/admin/services" },
  { icon: Image, label: "Sliderlar", href: "/admin/sliders" },
  { icon: FileText, label: "Başvurular", href: "/admin/applications" },
  { icon: Settings, label: "Ayarlar", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Immediately navigate to login page for faster UX
    startTransition(() => {
      router.push("/admin/login");
    });
    // Then sign out in background
    await signOut({ redirect: false });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-brand-black rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-brand-black text-white z-50
          transform transition-transform duration-150 lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white/60 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Menüyü Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <span className="text-xs text-white/50 block">Yönetici Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    prefetch={true}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-100 min-h-[44px] touch-manipulation
                      ${active 
                        ? "bg-brand-red text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150 min-h-[44px] touch-manipulation"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="font-medium">Açık Tema</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="font-medium">Koyu Tema</span>
              </>
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150 disabled:opacity-50 min-h-[44px] touch-manipulation"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            <span className="font-medium">{isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
