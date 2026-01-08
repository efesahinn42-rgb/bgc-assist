"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Package, 
  Calendar,
  Save,
  Loader2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  fullName: string;
  tcNo: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string | null;
  plate: string;
  brand: string;
  model: string | null;
  year: string | null;
  packageName: string;
  packagePrice: number | null;
  status: string;
  notes: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: "PENDING", label: "Beklemede", color: "bg-amber-500" },
  { value: "CONTACTED", label: "İletişime Geçildi", color: "bg-blue-500" },
  { value: "PROCESSING", label: "İşleniyor", color: "bg-purple-500" },
  { value: "APPROVED", label: "Onaylandı", color: "bg-emerald-500" },
  { value: "REJECTED", label: "Reddedildi", color: "bg-red-500" },
  { value: "COMPLETED", label: "Tamamlandı", color: "bg-gray-500" },
];

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    fetchApplication();
  }, [resolvedParams.id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/applications/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
        setFormData({
          status: data.status,
          notes: data.notes || "",
          assignedTo: data.assignedTo || "",
        });
      } else {
        router.push("/admin/applications");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/applications/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetchApplication();
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red" />
      </div>
    );
  }

  if (!session || !application) {
    return null;
  }

  const currentStatus = statusOptions.find(s => s.value === application.status);

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Başvuru Detayı" 
        description={`${application.fullName} - ${application.plate}`} 
      />

      <div className="p-6">
        {/* Back Button */}
        <Link href="/admin/applications" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Başvurulara Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-brand-red" />
                <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Ad Soyad</label>
                  <p className="text-lg font-semibold text-gray-900">{application.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">TC Kimlik No</label>
                  <p className="text-lg font-semibold text-gray-900">{application.tcNo}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> E-posta
                  </label>
                  <a href={`mailto:${application.email}`} className="text-brand-red hover:underline">
                    {application.email}
                  </a>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Telefon
                  </label>
                  <a href={`tel:${application.phone}`} className="text-brand-red hover:underline font-semibold">
                    {application.phone}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-brand-red" />
                <h2 className="text-lg font-semibold text-gray-900">Adres Bilgileri</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">İl</label>
                  <p className="text-lg font-semibold text-gray-900">{application.city}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">İlçe</label>
                  <p className="text-lg font-semibold text-gray-900">{application.district}</p>
                </div>
                {application.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Açık Adres</label>
                    <p className="text-gray-900">{application.address}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Vehicle Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <Car className="w-5 h-5 text-brand-red" />
                <h2 className="text-lg font-semibold text-gray-900">Araç Bilgileri</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Plaka</label>
                  <p className="text-2xl font-bold text-gray-900">{application.plate}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Marka</label>
                  <p className="text-lg font-semibold text-gray-900">{application.brand}</p>
                </div>
                {application.model && (
                  <div>
                    <label className="text-sm text-gray-500">Model</label>
                    <p className="text-lg font-semibold text-gray-900">{application.model}</p>
                  </div>
                )}
                {application.year && (
                  <div>
                    <label className="text-sm text-gray-500">Model Yılı</label>
                    <p className="text-lg font-semibold text-gray-900">{application.year}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-brand-red to-red-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Seçilen Paket</h2>
              </div>
              <p className="text-3xl font-bold mb-2">{application.packageName}</p>
              {application.packagePrice && (
                <p className="text-2xl font-semibold text-white/90">₺{application.packagePrice}</p>
              )}
            </motion.div>

            {/* Status & Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Durum Yönetimi</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Atanan Kişi</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="İsim giriniz"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Notlar</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Not ekleyin..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none resize-none"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-brand-red hover:bg-brand-red-dark text-white py-5"
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
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-red" />
                <h2 className="text-lg font-semibold text-gray-900">Zaman Çizelgesi</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${currentStatus?.color || 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Başvuru Alındı</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
                {application.updatedAt !== application.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1.5 bg-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Son Güncelleme</p>
                      <p className="text-sm text-gray-500">
                        {new Date(application.updatedAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
