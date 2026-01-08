import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Get pending applications count
    const pendingCount = await prisma.application.count({
      where: { status: "PENDING" },
    });

    // Get recent applications (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentApplications = await prisma.application.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        packageName: true,
        status: true,
        createdAt: true,
      },
    });

    // Get applications that need attention (pending for more than 24 hours)
    const oldPendingApplications = await prisma.application.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: yesterday,
        },
      },
      take: 5,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        fullName: true,
        packageName: true,
        createdAt: true,
      },
    });

    // Build notifications array
    const notifications = [];

    // Add pending count notification
    if (pendingCount > 0) {
      notifications.push({
        id: "pending-count",
        type: "pending",
        title: `${pendingCount} Bekleyen Başvuru`,
        message: `${pendingCount} adet başvuru onay bekliyor`,
        link: "/admin/applications?status=PENDING",
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    // Add old pending applications notifications
    oldPendingApplications.forEach((app) => {
      const hoursAgo = Math.floor(
        (new Date().getTime() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60)
      );
      notifications.push({
        id: `old-pending-${app.id}`,
        type: "warning",
        title: "Uzun Süredir Bekleyen Başvuru",
        message: `${app.fullName} - ${hoursAgo} saatten fazla bekliyor`,
        link: `/admin/applications/${app.id}`,
        createdAt: app.createdAt,
        read: false,
      });
    });

    // Add recent applications notifications
    recentApplications.slice(0, 5).forEach((app) => {
      notifications.push({
        id: `recent-${app.id}`,
        type: "new",
        title: "Yeni Başvuru",
        message: `${app.fullName} - ${app.packageName} paketi`,
        link: `/admin/applications/${app.id}`,
        createdAt: app.createdAt,
        read: false,
      });
    });

    // Sort by date (newest first)
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications: notifications.slice(0, 10), // Limit to 10 most recent
      unreadCount,
      pendingCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Bildirimler yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    // In a real app, you would mark notifications as read in database
    // For now, we'll just return success
    // This could be implemented with a Notification model in Prisma

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Bildirim güncellenemedi" },
      { status: 500 }
    );
  }
}
