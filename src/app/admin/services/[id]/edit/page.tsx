"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const iconOptions = [
  "Truck", "Disc3", "Fuel", "Key", "BatteryCharging", "Wrench", 
  "Car", "Shield", "Phone", "MapPin", "Clock", "Settings"
];

const colorOptions = [
  { name: "Mavi", value: "bg-blue-500" },
  { name: "Yeşil", value: "bg-green-500" },
  { name: "Mor", value: "bg-purple-500" },
  { name: "Pembe", value: "bg-pink-500" },
  { name: "Sarı", value: "bg-yellow-500" },
  { name: "Kırmızı", value: "bg-red-500" },
  { name: "Turuncu", value: "bg-orange-500" },
  { name: "Turkuaz", value: "bg-cyan-500" },
];

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "Truck",
    color: "bg-blue-500",
    modalImage: "",
    modalDescription: "",
    interventionTime: "",
    coverageArea: "",
    featuresList: [""],
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchService();
  }, [resolvedParams.id]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title,
          description: data.description,
          icon: data.icon,
          color: data.color,
          modalImage: data.modalImage || "",
          modalDescription: data.modalDescription || "",
          interventionTime: data.interventionTime || "",
          coverageArea: data.coverageArea || "",
          featuresList: Array.isArray(data.featuresList) && data.featuresList.length > 0 
            ? data.featuresList 
            : [""],
          order: data.order,
          isActive: data.isActive,
        });
      } else {
        router.push("/admin/services");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      router.push("/admin/services");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      featuresList: [...prev.featuresList, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      featuresList: prev.featuresList.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      featuresList: prev.featuresList.map((f, i) => (i === index ? value : f)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/services/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          featuresList: formData.featuresList.filter(f => f.trim() !== ""),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Hizmet güncellenemedi");
      }

      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Hizmeti Düzenle" 
        description={formData.title} 
      />

      <div className="p-6">
        <Link href="/admin/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Hizmetlere Dön
        </Link>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="max-w-3xl"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                  placeholder="Örn: Çekici Hizmeti"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kısa Açıklama *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none"
                  rows={3}
                  placeholder="Hizmetin kısa açıklaması..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İkon *
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => updateFormData("icon", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renk *
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateFormData("color", color.value)}
                      className={`w-10 h-10 rounded-lg ${color.value} transition-all ${
                        formData.color === color.value 
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110" 
                          : "hover:scale-105"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => updateFormData("order", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            {/* Modal Info */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Modal Bilgileri</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modal Görseli (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.modalImage}
                    onChange={(e) => updateFormData("modalImage", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detaylı Açıklama
                  </label>
                  <textarea
                    value={formData.modalDescription}
                    onChange={(e) => updateFormData("modalDescription", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none"
                    rows={4}
                    placeholder="Modal içinde gösterilecek detaylı açıklama..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müdahale Süresi
                  </label>
                  <input
                    type="text"
                    value={formData.interventionTime}
                    onChange={(e) => updateFormData("interventionTime", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="Örn: 20 Dakika"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapsama Alanı
                  </label>
                  <input
                    type="text"
                    value={formData.coverageArea}
                    onChange={(e) => updateFormData("coverageArea", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                    placeholder="Örn: Tüm Türkiye"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Özellikler</h3>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ekle
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.featuresList.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                      placeholder="Özellik yazın..."
                    />
                    {formData.featuresList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="border-t border-gray-100 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => updateFormData("isActive", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                />
                <span className="font-medium text-gray-700">Hizmeti aktif olarak yayınla</span>
              </label>
            </div>

            {/* Submit */}
            <div className="border-t border-gray-100 pt-6 flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-red hover:bg-brand-red-dark text-white px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
              <Link href="/admin/services">
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
