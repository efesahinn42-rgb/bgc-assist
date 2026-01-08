import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tek hizmet getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Hizmet yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Hizmet güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: body.title ?? existingService.title,
        description: body.description ?? existingService.description,
        icon: body.icon ?? existingService.icon,
        color: body.color ?? existingService.color,
        modalImage: body.modalImage ?? existingService.modalImage,
        modalDescription: body.modalDescription ?? existingService.modalDescription,
        interventionTime: body.interventionTime ?? existingService.interventionTime,
        coverageArea: body.coverageArea ?? existingService.coverageArea,
        featuresList: body.featuresList ?? existingService.featuresList,
        order: body.order ?? existingService.order,
        isActive: body.isActive ?? existingService.isActive,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Hizmet güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Hizmet sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Hizmet silindi" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Hizmet silinemedi" },
      { status: 500 }
    );
  }
}
