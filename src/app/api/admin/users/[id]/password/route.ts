import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Şifre değiştir
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
    const { currentPassword, newPassword } = body;

    // Validation
    if (!newPassword) {
      return NextResponse.json(
        { error: "Yeni şifre gerekli" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.admin.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // If changing own password, require current password
    // If SUPER_ADMIN changing others, no current password needed
    if (session.user.id === id) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Mevcut şifre gerekli" },
          { status: 400 }
        );
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Mevcut şifre yanlış" },
          { status: 400 }
        );
      }
    } else {
      // SUPER_ADMIN can change others' passwords without current password
      if (session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
          { status: 403 }
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Şifre değiştirilemedi" },
      { status: 500 }
    );
  }
}
