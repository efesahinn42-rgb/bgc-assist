import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Tüm admin kullanıcılarını getir (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN can view all users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const users = await prisma.admin.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Kullanıcılar yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni admin kullanıcı oluştur (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN can create users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için SUPER_ADMIN yetkisi gerekli" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, isActive } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, şifre ve isim gerekli" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "ADMIN",
        isActive: isActive !== undefined ? isActive : true,
      },
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulamadı" },
      { status: 500 }
    );
  }
}
