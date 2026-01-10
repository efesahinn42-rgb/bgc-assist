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
    const lastCheck = searchParams.get("lastCheck"); // ISO timestamp

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

    // Eğer lastCheck varsa, sadece yeni başvuruları getir
    const whereForNew = { ...where };
    let lastCheckDate: Date | null = null;
    let newCount = 0; // newCount'u daha geniş scope'ta tanımla
    
    if (lastCheck) {
      try {
        lastCheckDate = new Date(lastCheck);
        whereForNew.createdAt = { gt: lastCheckDate };
      } catch (error) {
        // Geçersiz timestamp, tüm verileri getir
        console.error("Invalid lastCheck timestamp:", error);
        lastCheckDate = null;
      }
    }

    // Polling modunda (lastCheck varsa) önce yeni veri kontrolü yap
    if (lastCheck && lastCheckDate) {
      // Önce sadece count kontrolü yap (daha hızlı)
      newCount = await prisma.application.count({ where: whereForNew });
      
      if (newCount === 0) {
        // Yeni veri yok, gereksiz query'leri atla
        return NextResponse.json({
          applications: [],
          pagination: {
            page,
            limit,
            total: await prisma.application.count({ where }), // Total count hala gerekli
            totalPages: Math.ceil((await prisma.application.count({ where })) / limit),
          },
          hasNewData: false,
          newCount: 0,
        });
      }

      // Yeni veri var, sadece yeni başvuruları getir
      const applications = await prisma.application.findMany({
        where: whereForNew,
        orderBy: { createdAt: "desc" },
        take: 100, // Max 100 yeni başvuru
      });

      const total = await prisma.application.count({ where });

      return NextResponse.json({
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        hasNewData: true,
        newCount,
      });
    }

    // Normal mod (lastCheck yok) - tüm query'leri çalıştır
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
      hasNewData: false,
      newCount: applications.length,
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
    
    // Validate required fields (only fullName, phone, packageName are required)
    const requiredFields = ["fullName", "phone", "packageName"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} alanı gerekli` },
          { status: 400 }
        );
      }
    }

    // Validate phone
    if (body.phone.length < 10) {
      return NextResponse.json(
        { error: "Geçerli bir telefon numarası giriniz" },
        { status: 400 }
      );
    }

    // Optional: Validate TC number if provided
    if (body.tcNo && body.tcNo.length !== 11) {
      return NextResponse.json(
        { error: "TC Kimlik numarası 11 haneli olmalıdır" },
        { status: 400 }
      );
    }

    const newApplication = await prisma.application.create({
      data: {
        fullName: body.fullName,
        tcNo: body.tcNo || null,
        email: body.email || null,
        phone: body.phone,
        city: body.city || null,
        district: body.district || null,
        address: body.address || null,
        plate: body.plate ? body.plate.toUpperCase() : null,
        brand: body.brand || null,
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
          tcNo: newApplication.tcNo ?? undefined,
          email: newApplication.email ?? undefined,
          phone: newApplication.phone,
          city: newApplication.city ?? undefined,
          district: newApplication.district ?? undefined,
          address: newApplication.address ?? undefined,
          plate: newApplication.plate ?? undefined,
          brand: newApplication.brand ?? undefined,
          model: newApplication.model ?? undefined,
          year: newApplication.year ?? undefined,
          packageName: newApplication.packageName,
          packagePrice: newApplication.packagePrice ?? undefined,
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
