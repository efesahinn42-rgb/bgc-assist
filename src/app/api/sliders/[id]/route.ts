import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tek slider getir (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const slider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!slider) {
      return NextResponse.json(
        { error: "Slider bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(slider);
  } catch (error) {
    console.error("Error fetching slider:", error);
    return NextResponse.json(
      { error: "Slider yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Slider güncelle (admin auth gerekli)
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

    // Get old data for audit log
    const oldSlider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!oldSlider) {
      return NextResponse.json(
        { error: "Slider bulunamadı" },
        { status: 404 }
      );
    }

    // Validate stats format if provided
    if (body.stats && !Array.isArray(body.stats)) {
      return NextResponse.json(
        { error: "Stats bir array olmalıdır" },
        { status: 400 }
      );
    }

    const updatedSlider = await prisma.sliderItem.update({
      where: { id },
      data: {
        category: body.category ?? oldSlider.category,
        title: body.title ?? oldSlider.title,
        description: body.description ?? oldSlider.description,
        image: body.image ?? oldSlider.image,
        color: body.color ?? oldSlider.color,
        stats: body.stats !== undefined ? body.stats : oldSlider.stats,
        order: body.order !== undefined ? parseInt(body.order) : oldSlider.order,
        isActive: body.isActive !== undefined ? body.isActive : oldSlider.isActive,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "UPDATE",
        entity: "SliderItem",
        entityId: id,
        oldData: oldSlider as object,
        newData: updatedSlider as object,
      },
    });

    return NextResponse.json(updatedSlider);
  } catch (error) {
    console.error("Error updating slider:", error);
    return NextResponse.json(
      { error: "Slider güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Slider sil (admin auth gerekli)
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

    // Get old data for audit log
    const oldSlider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!oldSlider) {
      return NextResponse.json(
        { error: "Slider bulunamadı" },
        { status: 404 }
      );
    }

    // Hard delete - remove from database
    await prisma.sliderItem.delete({
      where: { id },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "DELETE",
        entity: "SliderItem",
        entityId: id,
        oldData: oldSlider as object,
      },
    });

    return NextResponse.json({ message: "Slider silindi" });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return NextResponse.json(
      { error: "Slider silinemedi" },
      { status: 500 }
    );
  }
}
