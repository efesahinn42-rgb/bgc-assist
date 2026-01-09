"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  Phone, 
  Mail, 
  Car, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  BarChart3,
  CalendarDays
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Statistics {
  total: number;
  thisMonth: number;
  thisYear: number;
  byStatus: Record<string, number>;
  monthlyTrend: { month: string; year: number; count: number }[];
  pendingCount: number;
  approvedCount: number;
}

const statusOptions = [
  { value: "all", label: "Tümü" },
  { value: "PENDING", label: "Beklemede", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  { value: "CONTACTED", label: "İletişime Geçildi", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  { value: "PROCESSING", label: "İşleniyor", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  { value: "APPROVED", label: "Onaylandı", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  { value: "REJECTED", label: "Reddedildi", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  { value: "COMPLETED", label: "Tamamlandı", color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
];

const getStatusBadge = (status: string) => {
  const option = statusOptions.find(s => s.value === status);
  return option ? option.color : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
};

export default function ApplicationsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isPageFocused, setIsPageFocused] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [authStatus, router]);

  // Sayfa görünürlüğü kontrolü
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Window focus/blur kontrolü
  useEffect(() => {
    const handleFocus = () => setIsPageFocused(true);
    const handleBlur = () => setIsPageFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Fetch fonksiyonları - useEffect'lerden önce tanımlanmalı
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/statistics");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      });
      if (search) {
        params.append("search", search);
      }

      const res = await fetch(`/api/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (session) {
      fetchStatistics();
    }
  }, [session, fetchStatistics]);

  // Polling mekanizması - sadece sayfa görünür ve focus'tayken çalışır
  useEffect(() => {
    if (!session || authStatus !== "authenticated") return;

    // Polling sadece sayfa görünür ve focus'tayken aktif
    const shouldPoll = isPageVisible && isPageFocused;

    if (!shouldPoll) return;

    // İlk fetch'i hemen yap
    const fetchData = () => {
      fetchApplications();
      fetchStatistics();
    };

    // 5 saniye aralıklarla otomatik yenileme
    const intervalId = setInterval(fetchData, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [session, authStatus, isPageVisible, isPageFocused, fetchApplications, fetchStatistics]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchApplications();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      const res = await fetch(`/api/applications/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `basvurular_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteModal(null);
        fetchApplications();
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchApplications();
        fetchStatistics();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Calculate max value for trend chart
  const maxTrendValue = stats?.monthlyTrend ? Math.max(...stats.monthlyTrend.map(t => t.count), 1) : 1;

  if (authStatus === "loading") {
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
        title="Başvurular" 
        description="Müşteri başvurularını yönetin" 
      />

      <div className="p-6">
        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "-" : stats?.total ?? 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toplam</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "-" : stats?.thisMonth ?? 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bu Ay</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "-" : stats?.thisYear ?? 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bu Yıl</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "-" : stats?.pendingCount ?? 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bekleyen</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Aylık Trend (Son 12 Ay)</h3>
            {statsLoading ? (
              <div className="flex items-end justify-between gap-1 h-24">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-200 animate-pulse rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between gap-1 h-24">
                {stats?.monthlyTrend?.map((item, index) => {
                  const height = maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 group relative"
                    >
                      <div
                        className="w-full bg-brand-red/80 hover:bg-brand-red rounded-t transition-all cursor-pointer"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.month}: {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {stats?.monthlyTrend?.[0]?.month?.slice(0, 3)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {stats?.monthlyTrend?.[11]?.month?.slice(0, 3)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Duruma Göre Dağılım</h3>
          <div className="flex flex-wrap gap-3">
            {statusOptions.filter(s => s.value !== "all").map((status) => {
              const count = stats?.byStatus?.[status.value] ?? 0;
              return (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status.value
                      ? status.color + " ring-2 ring-offset-2 ring-gray-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {status.label}: {count}
                </button>
              );
            })}
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-brand-red text-white ring-2 ring-offset-2 ring-brand-red/50"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tümü: {stats?.total ?? 0}
            </button>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="İsim, telefon, e-posta veya plaka ara..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none min-h-[44px] text-base"
              />
            </div>
            <Button onClick={handleSearch} className="bg-brand-red hover:bg-brand-red-dark text-white">
              Ara
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none bg-white dark:bg-gray-800 dark:text-white min-h-[44px] text-base"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            variant="outline"
            disabled={isExporting}
            className="border-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Excel İndir
          </Button>
        </div>

        {/* Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Müşteri</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">İletişim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Araç</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Paket</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tarih</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-red mx-auto" />
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Başvuru bulunamadı.
                    </td>
                  </tr>
                ) : (
                  applications.map((app, index) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{app.fullName}</p>
                          <p className="text-sm text-gray-500">{app.city}, {app.district}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${app.phone}`} className="text-gray-900 hover:text-brand-red">
                              {app.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a href={`mailto:${app.email}`} className="text-gray-500 hover:text-brand-red truncate max-w-[150px]">
                              {app.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{app.plate}</p>
                            <p className="text-sm text-gray-500">{app.brand} {app.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{app.packageName}</p>
                          {app.packagePrice && (
                            <p className="text-sm text-brand-red font-semibold">₺{app.packagePrice}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadge(app.status)}`}
                        >
                          {statusOptions.filter(s => s.value !== "all").map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(app.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/applications/${app.id}`}>
                            <button className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteModal(app.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Toplam {pagination.total} başvurudan {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} arası gösteriliyor
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Başvuruyu Sil</h3>
            <p className="text-gray-500 mb-6">
              Bu başvuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
                onClick={() => handleDelete(deleteModal)}
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
