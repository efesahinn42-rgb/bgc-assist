"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2,
    MapPin,
    Wrench,
    Eye,
    Trash2,
    Car,
    Key,
    Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupplierApplication {
    id: string;
    companyName: string;
    serviceType: string;
    authorizedName: string;
    email: string | null;
    phone: string;
    city: string;
    district: string;
    address: string | null;
    vehicleCount: number | null;
    notes: string | null;
    status: string;
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
    pendingCount: number;
    approvedCount: number;
}

const serviceTypeLabels: Record<string, { label: string; icon: React.ElementType }> = {
    OTO_KURTARMA: { label: "Oto Kurtarma", icon: Truck },
    OTO_KIRALAMA: { label: "Oto Kiralama", icon: Car },
    OTO_LASTIKCI: { label: "Oto Lastikçi", icon: Wrench },
    CILINGIR: { label: "Çilingir", icon: Key },
};

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

export default function SupplierApplicationsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState<SupplierApplication[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
    const [deleteModal, setDeleteModal] = useState<string | null>(null);
    const [detailModal, setDetailModal] = useState<SupplierApplication | null>(null);
    const [stats, setStats] = useState<Statistics | null>(null);

    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [authStatus, router]);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                status: statusFilter,
                serviceType: serviceTypeFilter,
            });
            if (search) {
                params.append("search", search);
            }

            const res = await fetch(`/api/supplier-applications?${params}`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications);
                setPagination(data.pagination);
                setStats(data.statistics);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, statusFilter, serviceTypeFilter, search]);

    useEffect(() => {
        if (session) {
            fetchApplications();
        }
    }, [session, fetchApplications]);

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchApplications();
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/supplier-applications/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDeleteModal(null);
                fetchApplications();
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/supplier-applications/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchApplications();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

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
                title="Tedarikçi Başvuruları"
                description="Tedarikçi başvurularını yönetin"
            />

            <div className="p-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.total ?? 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Başvuru</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.pendingCount ?? 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Bekleyen</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.approvedCount ?? 0}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Onaylanan</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

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
                                placeholder="Firma adı, yetkili adı, telefon veya şehir ara..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
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
                            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Service Type Filter */}
                    <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-gray-400" />
                        <select
                            value={serviceTypeFilter}
                            onChange={(e) => {
                                setServiceTypeFilter(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="all">Tüm Hizmetler</option>
                            {Object.entries(serviceTypeLabels).map(([value, { label }]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Firma</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Hizmet</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">İletişim</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Konum</th>
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
                                    applications.map((app, index) => {
                                        const serviceInfo = serviceTypeLabels[app.serviceType];
                                        const ServiceIcon = serviceInfo?.icon || Wrench;
                                        return (
                                            <motion.tr
                                                key={app.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{app.companyName}</p>
                                                        <p className="text-sm text-gray-500">{app.authorizedName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <ServiceIcon className="w-4 h-4 text-brand-red" />
                                                        <span className="text-gray-900 dark:text-white">{serviceInfo?.label || app.serviceType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            <a href={`tel:${app.phone}`} className="text-gray-900 dark:text-white hover:text-brand-red">
                                                                {app.phone}
                                                            </a>
                                                        </div>
                                                        {app.email && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Mail className="w-4 h-4 text-gray-400" />
                                                                <a href={`mailto:${app.email}`} className="text-gray-500 hover:text-brand-red truncate max-w-[150px]">
                                                                    {app.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-900 dark:text-white">{app.city}, {app.district}</span>
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
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setDetailModal(app)}
                                                            className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal(app.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
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

            {/* Detail Modal */}
            {detailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Başvuru Detayları</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">Firma Adı</label>
                                <p className="font-medium text-gray-900 dark:text-white">{detailModal.companyName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Hizmet Türü</label>
                                <p className="font-medium text-gray-900 dark:text-white">{serviceTypeLabels[detailModal.serviceType]?.label}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Yetkili</label>
                                <p className="font-medium text-gray-900 dark:text-white">{detailModal.authorizedName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Telefon</label>
                                <p className="font-medium text-gray-900 dark:text-white">{detailModal.phone}</p>
                            </div>
                            {detailModal.email && (
                                <div>
                                    <label className="text-sm text-gray-500">E-posta</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{detailModal.email}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-gray-500">Konum</label>
                                <p className="font-medium text-gray-900 dark:text-white">{detailModal.city}, {detailModal.district}</p>
                            </div>
                            {detailModal.address && (
                                <div>
                                    <label className="text-sm text-gray-500">Adres</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{detailModal.address}</p>
                                </div>
                            )}
                            {detailModal.vehicleCount && (
                                <div>
                                    <label className="text-sm text-gray-500">Araç Sayısı</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{detailModal.vehicleCount}</p>
                                </div>
                            )}
                            {detailModal.notes && (
                                <div>
                                    <label className="text-sm text-gray-500">Notlar</label>
                                    <p className="font-medium text-gray-900 dark:text-white">{detailModal.notes}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-gray-500">Başvuru Tarihi</label>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(detailModal.createdAt).toLocaleString("tr-TR")}
                                </p>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-6"
                            onClick={() => setDetailModal(null)}
                        >
                            Kapat
                        </Button>
                    </motion.div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Başvuruyu Sil</h3>
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
