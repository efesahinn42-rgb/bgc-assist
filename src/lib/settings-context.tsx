"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SiteSettings {
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

// Default settings (fallback while loading)
export const defaultSettings: SiteSettings = {
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

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Keep using default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // Return default settings if used outside provider (for SSR or standalone components)
    return { settings: defaultSettings, loading: false, refetch: async () => {} };
  }
  return context;
}
