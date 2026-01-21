import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApplicationEmail } from "@/lib/email";
import { apiError, apiSuccess, sanitizeEmail, sanitizePhone, sanitizePlate, parseIntSafe } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { validateRequired, validatePhone, validateTCNo, validateEmail } from "@/lib/validation";
import type { ApplicationListResponse, CreateApplicationRequest } from "@/types/api";

// GET - Tüm başvuruları getir (admin only)
export async function GET(request: NextRequest) {
  const startTime = Date.now();
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
        const total = await prisma.application.count({ where });
        const response: ApplicationListResponse = {
          applications: [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          hasNewData: false,
          newCount: 0,
        };
        logger.apiRequest("GET", "/api/applications", 200, Date.now() - startTime);
        return apiSuccess(response);
      }

      // Yeni veri var, sadece yeni başvuruları getir
      const applications = await prisma.application.findMany({
        where: whereForNew,
        orderBy: { createdAt: "desc" },
        take: 100, // Max 100 yeni başvuru
      });

      const total = await prisma.application.count({ where });

      const response: ApplicationListResponse = {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        hasNewData: true,
        newCount,
      };

      logger.apiRequest("GET", "/api/applications", 200, Date.now() - startTime);
      return apiSuccess(response);
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

    const response: ApplicationListResponse = {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      hasNewData: false,
      newCount: applications.length,
    };

    logger.apiRequest("GET", "/api/applications", 200, Date.now() - startTime);
    return apiSuccess(response);
  } catch (error) {
    logger.error("Error fetching applications", error, { path: "/api/applications" });
    logger.apiRequest("GET", "/api/applications", 500, Date.now() - startTime);
    return apiError("Başvurular yüklenemedi", 500);
  }
}

// POST - Yeni başvuru oluştur (public)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = (await request.json()) as CreateApplicationRequest;

    // Validate required fields
    const requiredValidation = validateRequired(body as unknown as Record<string, unknown>, ["fullName", "phone", "packageName"]);
    if (!requiredValidation.isValid) {
      logger.apiRequest("POST", "/api/applications", 400, Date.now() - startTime);
      return apiError(requiredValidation.error || "Gerekli alanlar eksik", 400);
    }

    // Validate phone
    const phoneValidation = validatePhone(body.phone);
    if (!phoneValidation.isValid) {
      logger.apiRequest("POST", "/api/applications", 400, Date.now() - startTime);
      return apiError(phoneValidation.error || "Geçerli bir telefon numarası giriniz", 400);
    }

    // Validate TC No if provided
    if (body.tcNo) {
      const tcValidation = validateTCNo(body.tcNo);
      if (!tcValidation.isValid) {
        logger.apiRequest("POST", "/api/applications", 400, Date.now() - startTime);
        return apiError(tcValidation.error || "Geçersiz TC Kimlik numarası", 400);
      }
    }

    // Validate email if provided
    if (body.email) {
      const emailValidation = validateEmail(body.email);
      if (!emailValidation.isValid) {
        logger.apiRequest("POST", "/api/applications", 400, Date.now() - startTime);
        return apiError(emailValidation.error || "Geçersiz email adresi", 400);
      }
    }

    // Sanitize inputs
    const sanitizedPhone = sanitizePhone(body.phone);
    const sanitizedEmail = body.email ? sanitizeEmail(body.email) : null;
    const sanitizedPlate = body.plate ? sanitizePlate(body.plate) : null;

    const newApplication = await prisma.application.create({
      data: {
        fullName: body.fullName.trim(),
        tcNo: body.tcNo?.trim() || null,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        city: body.city?.trim() || null,
        district: body.district?.trim() || null,
        address: body.address?.trim() || null,
        plate: sanitizedPlate,
        brand: body.brand?.trim() || null,
        model: body.model?.trim() || null,
        year: body.year?.trim() || null,
        packageName: body.packageName.trim(),
        packagePrice: body.packagePrice ? parseIntSafe(body.packagePrice) : null,
        status: "PENDING",
      },
    });

    // Email gönder (async, hata olsa bile başvuru kaydedilir)
    try {
      const testEmail = process.env.TEST_EMAIL;
      let companyEmail: string;

      if (testEmail) {
        companyEmail = testEmail;
        logger.info("Test mode: Sending email", { email: companyEmail });
      } else {
        const settings = await prisma.siteSetting.findUnique({
          where: { key: "email" },
        });
        companyEmail = settings?.value || "info@bgcassist.com";
        logger.info("Production mode: Sending email", { email: companyEmail });
      }

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
      logger.error("Email sending error (application saved)", emailError, {
        applicationId: newApplication.id,
      });
    }

    logger.dbOperation("CREATE", "Application", { id: newApplication.id });
    logger.apiRequest("POST", "/api/applications", 201, Date.now() - startTime);
    return apiSuccess(newApplication, 201);
  } catch (error) {
    logger.error("Error creating application", error, { path: "/api/applications" });
    logger.apiRequest("POST", "/api/applications", 500, Date.now() - startTime);
    return apiError("Başvuru oluşturulamadı", 500);
  }
}
