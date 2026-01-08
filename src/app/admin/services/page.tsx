"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  modalImage: string | null;
  modalDescription: string | null;
  interventionTime: string | null;
  coverageArea: string | null;
  featuresList: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error("Error toggling service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteModal(null);
        fetchServices();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleting(false);
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
        title="Hizmetler" 
        description="Hizmetleri yönetin ve düzenleyin" 
      />

      <div className="p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500">
            Toplam {services.length} hizmet
          </p>
          <Link href="/admin/services/new">
            <Button className="bg-brand-red hover:bg-brand-red-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hizmet
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
                !service.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Color Bar */}
              <div className={`h-2 ${service.color}`} />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                      <span className="text-white text-lg">
                        {service.icon.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-500">Sıra: {service.order}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(service.id, service.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isActive 
                        ? "text-emerald-500 hover:bg-emerald-50" 
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {service.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {service.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {service.interventionTime && (
                    <span>⏱ {service.interventionTime}</span>
                  )}
                  {service.coverageArea && (
                    <span>📍 {service.coverageArea}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Link href={`/admin/services/${service.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                  </Link>
                  <button
                    onClick={() => setDeleteModal(service.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500 mb-4">Henüz hizmet eklenmemiş.</p>
            <Link href="/admin/services/new">
              <Button className="bg-brand-red hover:bg-brand-red-dark text-white">
                <Plus className="w-4 h-4 mr-2" />
                İlk Hizmeti Ekle
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hizmeti Sil</h3>
            <p className="text-gray-500 mb-6">
              Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(deleteModal)}
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
