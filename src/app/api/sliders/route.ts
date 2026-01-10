import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tüm slider'ları getir (public, isActive filter ile)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";

    const sliders = await prisma.sliderItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { error: "Slider'lar yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni slider ekle (admin auth gerekli)
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
    const requiredFields = ["category", "title", "description", "image", "color"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} alanı gerekli` },
          { status: 400 }
        );
      }
    }

    // Validate stats format
    if (body.stats && !Array.isArray(body.stats)) {
      return NextResponse.json(
        { error: "Stats bir array olmalıdır" },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await prisma.sliderItem.aggregate({
      _max: { order: true },
    });

    const newSlider = await prisma.sliderItem.create({
      data: {
        category: body.category,
        title: body.title,
        description: body.description,
        image: body.image,
        color: body.color,
        stats: body.stats || [],
        order: body.order !== undefined ? parseInt(body.order) : (maxOrder._max.order || 0) + 1,
        isActive: body.isActive !== false,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "CREATE",
        entity: "SliderItem",
        entityId: newSlider.id,
        newData: newSlider as object,
      },
    });

    return NextResponse.json(newSlider, { status: 201 });
  } catch (error) {
    console.error("Error creating slider:", error);
    return NextResponse.json(
      { error: "Slider oluşturulamadı" },
      { status: 500 }
    );
  }
}
