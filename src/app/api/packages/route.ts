import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { validateRequired, validatePrice } from "@/lib/validation";
import { generateUniqueSlug, getMaxOrder, parseIntSafe } from "@/lib/api-utils";
import type { CreatePackageRequest } from "@/types/api";

// Cache configuration: revalidate every 60 seconds (1 minute)
export const revalidate = 60;

// GET - Tüm paketleri getir (public)
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";

    const packages = await prisma.package.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: "asc" },
    });

    logger.apiRequest("GET", "/api/packages", 200, Date.now() - startTime);
    return apiSuccess(packages);
  } catch (error) {
    logger.error("Error fetching packages", error, { path: "/api/packages" });
    logger.apiRequest("GET", "/api/packages", 500, Date.now() - startTime);
    return apiError("Paketler yüklenemedi", 500);
  }
}

// POST - Yeni paket ekle (protected)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("POST", "/api/packages", 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const body = (await request.json()) as CreatePackageRequest;

    // Validate required fields
    const requiredValidation = validateRequired(body as unknown as Record<string, unknown>, ["name", "price", "period", "description"]);
    if (!requiredValidation.isValid) {
      logger.apiRequest("POST", "/api/packages", 400, Date.now() - startTime);
      return apiError(requiredValidation.error || "Gerekli alanlar eksik", 400);
    }

    // Validate price
    const priceValidation = validatePrice(body.price);
    if (!priceValidation.isValid) {
      logger.apiRequest("POST", "/api/packages", 400, Date.now() - startTime);
      return apiError(priceValidation.error || "Geçersiz fiyat", 400);
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(body.name, async (slug) => {
      const existing = await prisma.package.findUnique({ where: { slug } });
      return !!existing;
    });

    // Get max order
    const order = await getMaxOrder(() =>
      prisma.package.aggregate({ _max: { order: true } })
    );

    const newPackage = await prisma.package.create({
      data: {
        name: body.name,
        slug,
        price: parseIntSafe(body.price),
        period: body.period,
        description: body.description,
        icon: body.icon || "Star",
        popular: body.popular || false,
        color: body.color || "bg-blue-500",
        features: (body.features as Prisma.InputJsonValue) || [],
        notIncluded: (body.notIncluded as Prisma.InputJsonValue) || [],
        order,
        isActive: body.isActive !== false,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "CREATE",
        entity: "Package",
        entityId: newPackage.id,
        newData: newPackage as object,
      },
    });

    logger.dbOperation("CREATE", "Package", { id: newPackage.id });
    logger.apiRequest("POST", "/api/packages", 201, Date.now() - startTime);
    return apiSuccess(newPackage, 201);
  } catch (error) {
    logger.error("Error creating package", error, { path: "/api/packages" });
    logger.apiRequest("POST", "/api/packages", 500, Date.now() - startTime);
    return apiError("Paket oluşturulamadı", 500);
  }
}
