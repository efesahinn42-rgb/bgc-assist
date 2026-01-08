import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tüm paketleri getir (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";

    const packages = await prisma.package.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Paketler yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni paket ekle (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.period || !body.description) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Get max order
    const maxOrder = await prisma.package.aggregate({
      _max: { order: true },
    });

    const newPackage = await prisma.package.create({
      data: {
        name: body.name,
        slug,
        price: parseInt(body.price),
        period: body.period,
        description: body.description,
        icon: body.icon || "Star",
        popular: body.popular || false,
        color: body.color || "bg-blue-500",
        features: body.features || [],
        notIncluded: body.notIncluded || [],
        order: (maxOrder._max.order || 0) + 1,
        isActive: body.isActive !== false,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "CREATE",
        entity: "Package",
        entityId: newPackage.id,
        newData: newPackage as object,
      },
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Paket oluşturulamadı" },
      { status: 500 }
    );
  }
}
