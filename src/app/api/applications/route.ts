import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApplicationEmail } from "@/lib/email";

// GET - Tüm başvuruları getir (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    
    if (status && status !== "all") {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { plate: { contains: search, mode: "insensitive" } },
        { tcNo: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Başvurular yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni başvuru oluştur (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["fullName", "tcNo", "email", "phone", "city", "district", "plate", "brand", "packageName"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} alanı gerekli` },
          { status: 400 }
        );
      }
    }

    // Validate TC number
    if (body.tcNo.length !== 11) {
      return NextResponse.json(
        { error: "TC Kimlik numarası 11 haneli olmalıdır" },
        { status: 400 }
      );
    }

    // Validate phone
    if (body.phone.length < 10) {
      return NextResponse.json(
        { error: "Geçerli bir telefon numarası giriniz" },
        { status: 400 }
      );
    }

    const newApplication = await prisma.application.create({
      data: {
        fullName: body.fullName,
        tcNo: body.tcNo,
        email: body.email,
        phone: body.phone,
        city: body.city,
        district: body.district,
        address: body.address || null,
        plate: body.plate.toUpperCase(),
        brand: body.brand,
        model: body.model || null,
        year: body.year || null,
        packageName: body.packageName,
        packagePrice: body.packagePrice ? parseInt(body.packagePrice) : null,
        status: "PENDING",
      },
    });

    // Email gönder (async, hata olsa bile başvuru kaydedilir)
    try {
      // Test için environment variable, yoksa site settings'ten email adresini al
      const testEmail = process.env.TEST_EMAIL;
      let companyEmail: string;
      
      if (testEmail) {
        // Test modu: Environment variable'dan al
        companyEmail = testEmail;
        console.log("🧪 Test modu: Email gönderilecek adres:", companyEmail);
      } else {
        // Production: Site settings'ten al
        const settings = await prisma.siteSetting.findUnique({
          where: { key: "email" },
        });
        companyEmail = settings?.value || "info@bgcassist.com";
        console.log("📧 Production modu: Email gönderilecek adres:", companyEmail);
      }
      
      // Email gönder
      await sendApplicationEmail(
        {
          fullName: newApplication.fullName,
          tcNo: newApplication.tcNo,
          email: newApplication.email,
          phone: newApplication.phone,
          city: newApplication.city,
          district: newApplication.district,
          address: newApplication.address || undefined,
          plate: newApplication.plate,
          brand: newApplication.brand,
          model: newApplication.model || undefined,
          year: newApplication.year || undefined,
          packageName: newApplication.packageName,
          packagePrice: newApplication.packagePrice || undefined,
        },
        companyEmail
      );
    } catch (emailError) {
      // Email gönderme hatası başvuruyu engellemez
      console.error("⚠️ Email gönderme hatası (başvuru kaydedildi):", emailError);
    }

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Başvuru oluşturulamadı" },
      { status: 500 }
    );
  }
}
