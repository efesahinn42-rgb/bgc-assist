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

    // Toplam başvuru sayısı
    const total = await prisma.application.count();

    // Bu ayki başvuru sayısı
    const thisMonth = await prisma.application.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Bu yılki başvuru sayısı
    const thisYear = await prisma.application.count({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
    });

    // Duruma göre dağılım
    const byStatusRaw = await prisma.application.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const byStatus: Record<string, number> = {};
    byStatusRaw.forEach((item) => {
      byStatus[item.status] = item._count.status;
    });

    // Aylık trend (son 12 ay)
    const monthlyTrend = [];
    const monthNames = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await prisma.application.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      });

      monthlyTrend.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        count,
      });
    }

    // Paket sayısı
    const totalPackages = await prisma.package.count({
      where: { isActive: true },
    });

    // Hizmet sayısı
    const totalServices = await prisma.service.count({
      where: { isActive: true },
    });

    // Son 5 başvuru
    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        packageName: true,
        status: true,
        createdAt: true,
      },
    });

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
