import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - İstatistikleri getir
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aylık trend için tarihleri önceden hesapla
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    const monthlyDates = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      monthlyDates.push({ date, nextMonth, monthName: monthNames[date.getMonth()], year: date.getFullYear() });
    }

    // Tüm query'leri paralel çalıştır
    const [
      total,
      thisMonth,
      thisYear,
      byStatusRaw,
      totalPackages,
      totalServices,
      recentApplications,
      ...monthlyCounts
    ] = await Promise.all([
      // Toplam başvuru sayısı
      prisma.application.count(),
      
      // Bu ayki başvuru sayısı
      prisma.application.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      
      // Bu yılki başvuru sayısı
      prisma.application.count({
        where: {
          createdAt: {
            gte: startOfYear,
          },
        },
      }),
      
      // Duruma göre dağılım
      prisma.application.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
      
      // Paket sayısı
      prisma.package.count({
        where: { isActive: true },
      }),
      
      // Hizmet sayısı
      prisma.service.count({
        where: { isActive: true },
      }),
      
      // Son 5 başvuru
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          packageName: true,
          status: true,
          createdAt: true,
        },
      }),
      
      // Aylık trend (paralel)
      ...monthlyDates.map(({ date, nextMonth }) =>
        prisma.application.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextMonth,
            },
          },
        })
      ),
    ]);

    // Duruma göre dağılımı işle
    const byStatus: Record<string, number> = {};
    byStatusRaw.forEach((item) => {
      byStatus[item.status] = item._count.status;
    });

    // Aylık trend'i oluştur
    const monthlyTrend = monthlyDates.map(({ monthName, year }, index) => ({
      month: monthName,
      year,
      count: monthlyCounts[index],
    }));

    // Bekleyen başvurular
    const pendingCount = byStatus["PENDING"] || 0;
    
    // Onaylanan başvurular
    const approvedCount = (byStatus["APPROVED"] || 0) + (byStatus["COMPLETED"] || 0);

    return NextResponse.json({
      total,
      thisMonth,
      thisYear,
      byStatus,
      monthlyTrend,
      totalPackages,
      totalServices,
      recentApplications,
      pendingCount,
      approvedCount,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "İstatistikler yüklenemedi" },
      { status: 500 }
    );
  }
}
