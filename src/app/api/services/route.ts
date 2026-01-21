import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, generateUniqueSlug, getMaxOrder } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { validateRequired } from "@/lib/validation";
import type { CreateServiceRequest } from "@/types/api";

// Cache configuration: revalidate every 60 seconds (1 minute)
export const revalidate = 60;

// GET - Tüm hizmetleri getir
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where: { isActive?: boolean } = session ? {} : { isActive: true };
    if (activeOnly) {
      where.isActive = true;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: "asc" },
    });

    logger.apiRequest("GET", "/api/services", 200, Date.now() - startTime);
    return apiSuccess(services);
  } catch (error) {
    logger.error("Error fetching services", error, { path: "/api/services" });
    logger.apiRequest("GET", "/api/services", 500, Date.now() - startTime);
    return apiError("Hizmetler yüklenemedi", 500);
  }
}

// POST - Yeni hizmet ekle (Admin yetkisi gerekli)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("POST", "/api/services", 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const body = (await request.json()) as CreateServiceRequest;

    // Validate required fields
    const requiredValidation = validateRequired(body as unknown as Record<string, unknown>, ["title", "description", "icon", "color"]);
    if (!requiredValidation.isValid) {
      logger.apiRequest("POST", "/api/services", 400, Date.now() - startTime);
      return apiError(requiredValidation.error || "Gerekli alanlar eksik", 400);
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(body.title, async (slug) => {
      const existing = await prisma.service.findUnique({ where: { slug } });
      return !!existing;
    });

    // Get max order
    const order = await getMaxOrder(() =>
      prisma.service.aggregate({ _max: { order: true } })
    );

    const newService = await prisma.service.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        icon: body.icon,
        color: body.color,
        modalImage: body.modalImage || null,
        modalDescription: body.modalDescription || null,
        interventionTime: body.interventionTime || null,
        coverageArea: body.coverageArea || null,
        featuresList: (body.featuresList as Prisma.InputJsonValue) || [],
        order,
        isActive: body.isActive ?? true,
      },
    });

    logger.dbOperation("CREATE", "Service", { id: newService.id });
    logger.apiRequest("POST", "/api/services", 201, Date.now() - startTime);
    return apiSuccess(newService, 201);
  } catch (error) {
    logger.error("Error creating service", error, { path: "/api/services" });
    logger.apiRequest("POST", "/api/services", 500, Date.now() - startTime);
    return apiError("Hizmet oluşturulamadı", 500);
  }
}
