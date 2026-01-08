"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { 
  Save, 
  Loader2, 
  Phone, 
  Mail, 
  MessageCircle,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  CheckCircle,
  MapPin,
  Clock,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Settings {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  city: string;
  workingHours: string;
  instagram: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  website: string;
}

const initialSettings: Settings = {
  phone: "0530 232 27 42",
  email: "info@bgcassist.com",
  whatsapp: "905302322742",
  address: "Akabe, Şht. Furkan Doğan Cd. Bey Plaza Kat:1 No:3/122, 42020 Karatay/Konya",
  city: "Konya",
  workingHours: "Açık · Kapanış saati: 19:00",
  instagram: "",
  twitter: "",
  facebook: "",
  linkedin: "",
  website: "https://bgcassist.com",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({ ...initialSettings, ...data });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ayarlar kaydedilemedi");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
      setError(errorMessage);
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          title="Ayarlar" 
          description="Site ayarlarını yönetin" 
        />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Ayarlar" 
        description="Site ayarlarını yönetin" 
      />

      <div className="p-6">
        <div className="max-w-3xl space-y-6">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-brand-red" />
              İletişim Bilgileri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => updateSetting("phone", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="0530 232 27 42"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="info@bgcassist.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Numarası
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.whatsapp}
                    onChange={(e) => updateSetting("whatsapp", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="905302322742"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ülke kodu ile birlikte yazın (90...)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Web Sitesi
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={settings.website}
                    onChange={(e) => updateSetting("website", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://bgcassist.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İl
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => updateSetting("city", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="Konya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Çalışma Saatleri
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={settings.workingHours}
                    onChange={(e) => updateSetting("workingHours", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="Açık · Kapanış saati: 19:00"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Adres
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none"
                  rows={2}
                  placeholder="Şirket adresi..."
                />
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Sosyal Medya Hesapları
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={settings.instagram}
                    onChange={(e) => updateSetting("instagram", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://instagram.com/bgcassist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter / X
                </label>
                <div className="relative">
                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={settings.twitter}
                    onChange={(e) => updateSetting("twitter", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://twitter.com/bgcassist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook
                </label>
                <div className="relative">
                  <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={settings.facebook}
                    onChange={(e) => updateSetting("facebook", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://facebook.com/bgcassist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={settings.linkedin}
                    onChange={(e) => updateSetting("linkedin", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://linkedin.com/company/bgcassist"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-red hover:bg-brand-red-dark text-white px-8 py-5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Kaydedildi!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Ayarları Kaydet
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
