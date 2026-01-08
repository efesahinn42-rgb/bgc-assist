"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Settings, Lock, LogOut, ChevronDown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { UserManagementModal } from "./UserManagementModal";

export function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/admin/login" });
  };

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <>
      <div ref={dropdownRef} className="relative">
        {/* User Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session?.user?.email}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center cursor-pointer hover:bg-brand-red/20 dark:hover:bg-brand-red/30 transition-colors">
            <User className="w-5 h-5 text-brand-red" />
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {session?.user?.email}
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-brand-red/10 dark:bg-brand-red/20 text-brand-red text-xs font-medium rounded">
                  {session?.user?.role === "SUPER_ADMIN" ? "Süper Admin" : 
                   session?.user?.role === "ADMIN" ? "Admin" : "Editör"}
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowUserManagement(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Users className="w-4 h-4" />
                    Kullanıcı Yönetimi
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <Lock className="w-4 h-4" />
                  Şifre Değiştir
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/admin/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Ayarlar
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userId={session?.user?.id || ""}
        isSelf={true}
      />

      {/* User Management Modal */}
      {isSuperAdmin && (
        <UserManagementModal
          isOpen={showUserManagement}
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </>
  );
}
