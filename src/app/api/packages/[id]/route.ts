import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tek paket getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Paket bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Paket yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Paket güncelle
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
    const oldPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!oldPackage) {
      return NextResponse.json(
        { error: "Paket bulunamadı" },
        { status: 404 }
      );
    }

    // Update slug if name changed
    let slug = oldPackage.slug;
    if (body.name && body.name !== oldPackage.name) {
      slug = body.name
        .toLowerCase()
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/ı/g, "i")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name: body.name ?? oldPackage.name,
        slug,
        price: body.price !== undefined ? parseInt(body.price) : oldPackage.price,
        period: body.period ?? oldPackage.period,
        description: body.description ?? oldPackage.description,
        icon: body.icon ?? oldPackage.icon,
        popular: body.popular ?? oldPackage.popular,
        color: body.color ?? oldPackage.color,
        features: body.features ?? oldPackage.features,
        notIncluded: body.notIncluded ?? oldPackage.notIncluded,
        order: body.order ?? oldPackage.order,
        isActive: body.isActive ?? oldPackage.isActive,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "UPDATE",
        entity: "Package",
        entityId: id,
        oldData: oldPackage as object,
        newData: updatedPackage as object,
      },
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Paket güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Paket sil
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
    const oldPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!oldPackage) {
      return NextResponse.json(
        { error: "Paket bulunamadı" },
        { status: 404 }
      );
    }

    // Soft delete - just mark as inactive
    await prisma.package.update({
      where: { id },
      data: { isActive: false },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "DELETE",
        entity: "Package",
        entityId: id,
        oldData: oldPackage as object,
      },
    });

    return NextResponse.json({ message: "Paket silindi" });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Paket silinemedi" },
      { status: 500 }
    );
  }
}
