import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, getMaxOrder, parseIntSafe } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { validateRequired } from "@/lib/validation";

// GET - Tüm slider'ları getir (public, isActive filter ile)
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";

    const sliders = await prisma.sliderItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: "asc" },
    });

    logger.apiRequest("GET", "/api/sliders", 200, Date.now() - startTime);
    return apiSuccess(sliders);
  } catch (error) {
    logger.error("Error fetching sliders", error, { path: "/api/sliders" });
    logger.apiRequest("GET", "/api/sliders", 500, Date.now() - startTime);
    return apiError("Slider'lar yüklenemedi", 500);
  }
}

// POST - Yeni slider ekle (admin auth gerekli)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("POST", "/api/sliders", 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const body = (await request.json()) as {
      category: string;
      title: string;
      description: string;
      image: string;
      color: string;
      stats?: unknown[];
      order?: number | string;
      isActive?: boolean;
    };

    // Validate required fields
    const requiredValidation = validateRequired(body as unknown as Record<string, unknown>, [
      "category",
      "title",
      "description",
      "image",
      "color",
    ]);
    if (!requiredValidation.isValid) {
      logger.apiRequest("POST", "/api/sliders", 400, Date.now() - startTime);
      return apiError(requiredValidation.error || "Gerekli alanlar eksik", 400);
    }

    // Validate stats format
    if (body.stats && !Array.isArray(body.stats)) {
      logger.apiRequest("POST", "/api/sliders", 400, Date.now() - startTime);
      return apiError("Stats bir array olmalıdır", 400);
    }

    // Get max order
    const order =
      body.order !== undefined
        ? parseIntSafe(body.order)
        : await getMaxOrder(() =>
          prisma.sliderItem.aggregate({ _max: { order: true } })
        );

    const newSlider = await prisma.sliderItem.create({
      data: {
        category: body.category,
        title: body.title,
        description: body.description,
        image: body.image,
        color: body.color,
        stats: (body.stats as Prisma.InputJsonValue) || [],
        order,
        isActive: body.isActive !== false,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "CREATE",
        entity: "SliderItem",
        entityId: newSlider.id,
        newData: newSlider as object,
      },
    });

    logger.dbOperation("CREATE", "SliderItem", { id: newSlider.id });
    logger.apiRequest("POST", "/api/sliders", 201, Date.now() - startTime);
    return apiSuccess(newSlider, 201);
  } catch (error) {
    logger.error("Error creating slider", error, { path: "/api/sliders" });
    logger.apiRequest("POST", "/api/sliders", 500, Date.now() - startTime);
    return apiError("Slider oluşturulamadı", 500);
  }
}
