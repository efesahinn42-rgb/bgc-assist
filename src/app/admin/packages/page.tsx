"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, MoreVertical, Eye, EyeOff, GripVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  period: string;
  description: string;
  icon: string;
  popular: boolean;
  color: string;
  features: string[];
  notIncluded: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function PackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages?active=false");
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (pkg: Package) => {
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      if (res.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("Error toggling package:", error);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModal(null);
        fetchPackages();
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Paketler" 
        description="Yol yardım paketlerini yönetin" 
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            Toplam <span className="font-semibold text-gray-900 dark:text-white">{packages.length}</span> paket
          </p>
          <Link href="/admin/packages/new">
            <Button className="bg-brand-red hover:bg-brand-red-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Paket Ekle
            </Button>
          </Link>
        </div>

        {/* Packages Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Popüler
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Henüz paket eklenmemiş.{" "}
                    <Link href="/admin/packages/new" className="text-brand-red hover:underline">
                      İlk paketi ekleyin
                    </Link>
                  </td>
                </tr>
              ) : (
                packages.map((pkg, index) => (
                  <motion.tr
                    key={pkg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!pkg.isActive ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <GripVertical className="w-4 h-4 cursor-grab" />
                        <span>{pkg.order}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${pkg.color} flex items-center justify-center`}>
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{pkg.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.description.substring(0, 40)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">₺{pkg.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.period}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(pkg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          pkg.isActive
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {pkg.isActive ? (
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
                    <td className="px-6 py-4">
                      {pkg.popular && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Popüler
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-brand-red hover:bg-brand-red/5 dark:hover:bg-brand-red/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteModal(pkg.id)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Paketi Sil</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Bu paketi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteModal(null)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => deletePackage(deleteModal)}
              >
                Sil
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
