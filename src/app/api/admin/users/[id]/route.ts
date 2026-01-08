import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Tek bir kullanıcıyı getir
export async function GET(
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

    // Only SUPER_ADMIN can view other users
    if (session.user.role !== "SUPER_ADMIN" && session.user.id !== id) {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const user = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { error: "Kullanıcı yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcıyı güncelle
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

    // Only SUPER_ADMIN can update other users
    if (session.user.role !== "SUPER_ADMIN" && session.user.id !== id) {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, role, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // If email is being changed, check if new email is available
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Only SUPER_ADMIN can change role
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (session.user.role === "SUPER_ADMIN") {
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Kullanıcıyı sil (SUPER_ADMIN only, cannot delete self)
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

    // Only SUPER_ADMIN can delete users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    // Cannot delete self
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.admin.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kullanıcı başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinemedi" },
      { status: 500 }
    );
  }
}
