"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Slider {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  color: string;
  stats: Array<{ icon: string; label: string; value: string }>;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SlidersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/sliders?active=false");
      if (res.ok) {
        const data = await res.json();
        setSliders(data);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (slider: Slider) => {
    try {
      const res = await fetch(`/api/sliders/${slider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slider.isActive }),
      });
      if (res.ok) {
        fetchSliders();
      }
    } catch (error) {
      console.error("Error toggling slider:", error);
    }
  };

  const deleteSlider = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sliders/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchSliders();
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading" || loading) {
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
        title="Sliderlar" 
        description="Ana sayfa slider'larını yönetin" 
      />

      <div className="p-4 sm:p-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Toplam <span className="font-semibold text-gray-900 dark:text-white">{sliders.length}</span> slider
          </p>
          <Link href="/admin/sliders/new">
            <Button className="bg-brand-red hover:bg-brand-red-dark text-white w-full sm:w-auto min-h-[44px] py-4">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Slider Ekle
            </Button>
          </Link>
        </div>

        {/* Sliders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Görsel
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sliders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Henüz slider eklenmemiş.{" "}
                      <Link href="/admin/sliders/new" className="text-brand-red hover:underline">
                        İlk slider'ı ekleyin
                      </Link>
                    </td>
                  </tr>
                ) : (
                  sliders.map((slider, index) => (
                    <motion.tr
                      key={slider.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!slider.isActive ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                          <GripVertical className="w-4 h-4 cursor-grab" />
                          <span>{slider.order}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={slider.image}
                            alt={slider.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {slider.category}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                            {slider.title.length > 50 ? `${slider.title.substring(0, 50)}...` : slider.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => toggleActive(slider)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] touch-manipulation ${
                            slider.isActive
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {slider.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Pasif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/sliders/${slider.id}/edit`}>
                            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-red hover:bg-brand-red/5 dark:hover:bg-brand-red/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteModal(slider.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Slider'ı Sil</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Bu slider'ı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 min-h-[44px] py-4"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white min-h-[44px] py-4"
                onClick={() => deleteSlider(deleteModal)}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sil"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
