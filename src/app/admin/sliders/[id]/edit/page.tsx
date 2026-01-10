"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Users,
  Star,
  Activity,
  Car,
  ShieldCheck,
} from "lucide-react";

const categoryOptions = [
  "Otomobil",
  "Motosiklet",
  "Hafif Ticari",
  "Ağır Ticari",
  "İkame Araç",
  "Moto Karavan",
];

const colorOptions = [
  { value: "blue", label: "Mavi" },
  { value: "orange", label: "Turuncu" },
  { value: "emerald", label: "Yeşil" },
  { value: "slate", label: "Gri" },
  { value: "violet", label: "Mor" },
  { value: "amber", label: "Sarı" },
];

const iconOptions = [
  { value: "Clock", label: "Saat", icon: Clock },
  { value: "MapPin", label: "Konum", icon: MapPin },
  { value: "Users", label: "Kullanıcılar", icon: Users },
  { value: "Star", label: "Yıldız", icon: Star },
  { value: "Activity", label: "Aktivite", icon: Activity },
  { value: "Car", label: "Araba", icon: Car },
  { value: "ShieldCheck", label: "Kalkan", icon: ShieldCheck },
];

interface Stat {
  icon: string;
  label: string;
  value: string;
}

interface Slider {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  color: string;
  stats: Stat[];
  order: number;
  isActive: boolean;
}

export default function EditSliderPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sliderId, setSliderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    category: "Otomobil",
    title: "",
    description: "",
    image: "",
    color: "blue",
    order: "",
    isActive: true,
  });

  const [stats, setStats] = useState<Stat[]>([
    { icon: "Clock", label: "", value: "" },
  ]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setSliderId(resolvedParams.id);
      fetchSlider(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  const fetchSlider = async (id: string) => {
    try {
      const res = await fetch(`/api/sliders/${id}`);
      if (res.ok) {
        const slider: Slider = await res.json();
        setFormData({
          category: slider.category,
          title: slider.title,
          description: slider.description,
          image: slider.image,
          color: slider.color,
          order: slider.order.toString(),
          isActive: slider.isActive,
        });
        setStats(slider.stats.length > 0 ? slider.stats : [{ icon: "Clock", label: "", value: "" }]);
        setImagePreview(slider.image);
      } else {
        setError("Slider yüklenemedi");
      }
    } catch (err) {
      setError("Slider yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/sliders/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        setImagePreview(data.url);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Resim yüklenemedi");
      }
    } catch (err) {
      setError("Resim yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addStat = () => {
    setStats([...stats, { icon: "Clock", label: "", value: "" }]);
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    setStats(stats.map((stat, i) => (i === index ? { ...stat, [field]: value } : stat)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validate stats
    const validStats = stats.filter(
      (stat) => stat.icon && stat.label.trim() && stat.value.trim()
    );

    try {
      const res = await fetch(`/api/sliders/${sliderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: formData.order ? parseInt(formData.order) : undefined,
          stats: validStats,
        }),
      });

      if (res.ok) {
        router.push("/admin/sliders");
      } else {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Slider Düzenle" 
        description="Slider bilgilerini güncelleyin" 
      />

      <div className="p-4 sm:p-6">
        <Link href="/admin/sliders">
          <Button
            variant="outline"
            className="mb-6 min-h-[44px] py-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </Link>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Renk *
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Örn: Yolda Kalmak Yok, Devam Etmek Var."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Slider açıklaması..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Otomatik"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Aktif
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Görsel *
              </h3>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-brand-red transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-red mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full max-w-md mx-auto">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors min-h-[44px]"
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(formData.image);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors min-h-[44px]"
                      >
                        <X className="w-4 h-4 inline mr-2" />
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Tıklayın veya sürükleyip bırakın
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      JPG, PNG veya WebP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  İstatistikler
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStat}
                  className="min-h-[44px] py-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  İstatistik Ekle
                </Button>
              </div>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        İkon
                      </label>
                      <select
                        value={stat.icon}
                        onChange={(e) => updateStat(index, "icon", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Etiket
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Örn: Ort. Varış"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Değer
                      </label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Örn: 18 Dk"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeStat(index)}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px] touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link href="/admin/sliders" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[44px] py-4"
                >
                  İptal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSaving || uploading || !formData.image}
                className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white min-h-[44px] py-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Güncelle"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
