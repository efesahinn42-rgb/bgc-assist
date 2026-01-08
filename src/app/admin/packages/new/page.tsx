"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const iconOptions = [
  { value: "Star", label: "Yıldız" },
  { value: "Zap", label: "Şimşek" },
  { value: "Crown", label: "Taç" },
  { value: "Shield", label: "Kalkan" },
  { value: "Truck", label: "Kamyon" },
  { value: "Users", label: "Kullanıcılar" },
];

const colorOptions = [
  { value: "bg-blue-500", label: "Mavi", color: "#3b82f6" },
  { value: "bg-emerald-500", label: "Yeşil", color: "#10b981" },
  { value: "bg-amber-500", label: "Sarı", color: "#f59e0b" },
  { value: "bg-purple-500", label: "Mor", color: "#8b5cf6" },
  { value: "bg-pink-500", label: "Pembe", color: "#ec4899" },
  { value: "bg-brand-red", label: "Kırmızı", color: "#dc2626" },
];

export default function NewPackagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    period: "Yıllık",
    description: "",
    icon: "Star",
    popular: false,
    color: "bg-blue-500",
    features: [""],
    notIncluded: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          features: formData.features.filter(f => f.trim() !== ""),
          notIncluded: formData.notIncluded.filter(f => f.trim() !== ""),
        }),
      });

      if (res.ok) {
        router.push("/admin/packages");
      } else {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = (type: "features" | "notIncluded") => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  const removeFeature = (type: "features" | "notIncluded", index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (type: "features" | "notIncluded", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((f, i) => i === index ? value : f),
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red" />
      </div>
    );
  }

  if (!session) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Yeni Paket Ekle" 
        description="Yeni bir yol yardım paketi oluşturun" 
      />

      <div className="p-6">
        {/* Back Button */}
        <Link href="/admin/packages" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Paketlere Dön
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paket Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    placeholder="Örn: Premium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                    placeholder="Örn: 1499"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periyot *
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  >
                    <option value="Yıllık">Yıllık</option>
                    <option value="6 Aylık">6 Aylık</option>
                    <option value="Aylık">Aylık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İkon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none resize-none"
                    rows={3}
                    placeholder="Paket açıklaması..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Görünüm</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renk
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: opt.value })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          formData.color === opt.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                        }`}
                        style={{ backgroundColor: opt.color }}
                      >
                        {formData.color === opt.value && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                  />
                  <label htmlFor="popular" className="text-sm font-medium text-gray-700">
                    Popüler olarak işaretle
                  </label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Özellikler</h2>
              
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature("features", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                      placeholder="Özellik ekleyin..."
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature("features", index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFeature("features")}
                  className="flex items-center gap-2 text-brand-red hover:text-brand-red-dark text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Özellik Ekle
                </button>
              </div>
            </div>

            {/* Not Included */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dahil Olmayanlar</h2>
              
              <div className="space-y-3">
                {formData.notIncluded.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateFeature("notIncluded", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                      placeholder="Dahil olmayan özellik..."
                    />
                    {formData.notIncluded.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature("notIncluded", index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFeature("notIncluded")}
                  className="flex items-center gap-2 text-brand-red hover:text-brand-red-dark text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link href="/admin/packages" className="flex-1">
                <Button type="button" variant="outline" className="w-full py-6">
                  İptal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Paketi Kaydet"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
