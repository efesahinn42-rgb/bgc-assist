"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { motion } from "framer-motion";
import { Package, Wrench, FileText, TrendingUp, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Statistics {
  total: number;
  thisMonth: number;
  thisYear: number;
  totalPackages: number;
  totalServices: number;
  pendingCount: number;
  approvedCount: number;
  recentApplications: {
    id: string;
    fullName: string;
    packageName: string;
    status: string;
    createdAt: string;
  }[];
}

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  CONTACTED: "İletişime Geçildi",
  PROCESSING: "İşleniyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  COMPLETED: "Tamamlandı",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  CONTACTED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  PROCESSING: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  APPROVED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  COMPLETED: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStatistics();
    }
  }, [session]);

  const fetchStatistics = async () => {
    try {
      const res = await fetch("/api/statistics");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statCards = [
    { 
      label: "Toplam Paket", 
      value: stats?.totalPackages ?? 0, 
      icon: Package, 
      color: "bg-blue-500", 
      href: "/admin/packages" 
    },
    { 
      label: "Hizmetler", 
      value: stats?.totalServices ?? 0, 
      icon: Wrench, 
      color: "bg-emerald-500", 
      href: "/admin/services" 
    },
    { 
      label: "Toplam Başvuru", 
      value: stats?.total ?? 0, 
      icon: FileText, 
      color: "bg-amber-500", 
      href: "/admin/applications" 
    },
    { 
      label: "Bu Ay", 
      value: stats?.thisMonth ?? 0, 
      icon: TrendingUp, 
      color: "bg-purple-500", 
      href: "/admin/applications" 
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Dashboard" 
        description={`Hoş geldiniz, ${session.user?.name || "Admin"}!`} 
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={stat.href}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          {loading ? (
                            <span className="inline-block w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Bekleyen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "-" : stats?.pendingCount ?? 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Onaylanan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "-" : stats?.approvedCount ?? 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Bu Yıl</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "-" : stats?.thisYear ?? 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/packages/new"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-brand-red/5 dark:hover:bg-brand-red/10 hover:border-brand-red border border-transparent transition-all"
              >
                <Package className="w-8 h-8 text-brand-red mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Paket</span>
              </Link>
              <Link
                href="/admin/services/new"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-brand-red/5 dark:hover:bg-brand-red/10 hover:border-brand-red border border-transparent transition-all"
              >
                <Wrench className="w-8 h-8 text-brand-red mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Hizmet</span>
              </Link>
              <Link
                href="/admin/applications"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-brand-red/5 dark:hover:bg-brand-red/10 hover:border-brand-red border border-transparent transition-all"
              >
                <FileText className="w-8 h-8 text-brand-red mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Başvurular</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-brand-red/5 dark:hover:bg-brand-red/10 hover:border-brand-red border border-transparent transition-all"
              >
                <Users className="w-8 h-8 text-brand-red mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Siteyi Gör</span>
              </Link>
            </div>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Başvurular</h2>
              <Link href="/admin/applications" className="text-sm text-brand-red hover:underline">
                Tümünü Gör
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentApplications && stats.recentApplications.length > 0 ? (
                stats.recentApplications.map((app) => (
                  <Link key={app.id} href={`/admin/applications/${app.id}`}>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex items-center justify-center">
                        <span className="text-brand-red font-semibold text-sm">
                          {app.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{app.packageName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                  Henüz başvuru yok
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
