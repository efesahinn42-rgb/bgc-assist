import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tüm hizmetleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where = session ? {} : { isActive: true };
    if (activeOnly) {
      where.isActive = true;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Hizmetler yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni hizmet ekle (Admin yetkisi gerekli)
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
    const requiredFields = ["title", "description", "icon", "color"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} alanı gerekli` },
          { status: 400 }
        );
      }
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    const finalSlug = existingService ? `${slug}-${Date.now()}` : slug;

    // Get max order
    const maxOrder = await prisma.service.aggregate({
      _max: { order: true },
    });

    const newService = await prisma.service.create({
      data: {
        title: body.title,
        slug: finalSlug,
        description: body.description,
        icon: body.icon,
        color: body.color,
        modalImage: body.modalImage || null,
        modalDescription: body.modalDescription || null,
        interventionTime: body.interventionTime || null,
        coverageArea: body.coverageArea || null,
        featuresList: body.featuresList || [],
        order: (maxOrder._max.order || 0) + 1,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Hizmet oluşturulamadı" },
      { status: 500 }
    );
  }
}
