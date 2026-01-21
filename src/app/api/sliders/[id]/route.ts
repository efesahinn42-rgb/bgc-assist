import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, parseIntSafe } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

// GET - Tek slider getir (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;

    const slider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!slider) {
      logger.apiRequest("GET", `/api/sliders/${id}`, 404, Date.now() - startTime);
      return apiError("Slider bulunamadı", 404);
    }

    logger.apiRequest("GET", `/api/sliders/${id}`, 200, Date.now() - startTime);
    return apiSuccess(slider);
  } catch (error) {
    logger.error("Error fetching slider", error, { path: `/api/sliders/[id]` });
    logger.apiRequest("GET", `/api/sliders/[id]`, 500, Date.now() - startTime);
    return apiError("Slider yüklenemedi", 500);
  }
}

// PUT - Slider güncelle (admin auth gerekli)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("PUT", `/api/sliders/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;
    const body = (await request.json()) as {
      category?: string;
      title?: string;
      description?: string;
      image?: string;
      color?: string;
      stats?: unknown[];
      order?: number | string;
      isActive?: boolean;
    };

    // Get old data for audit log
    const oldSlider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!oldSlider) {
      logger.apiRequest("PUT", `/api/sliders/${id}`, 404, Date.now() - startTime);
      return apiError("Slider bulunamadı", 404);
    }

    // Validate stats format if provided
    if (body.stats !== undefined && !Array.isArray(body.stats)) {
      logger.apiRequest("PUT", `/api/sliders/${id}`, 400, Date.now() - startTime);
      return apiError("Stats bir array olmalıdır", 400);
    }

    const updatedSlider = await prisma.sliderItem.update({
      where: { id },
      data: {
        category: body.category ?? oldSlider.category,
        title: body.title ?? oldSlider.title,
        description: body.description ?? oldSlider.description,
        image: body.image ?? oldSlider.image,
        color: body.color ?? oldSlider.color,
        stats: body.stats !== undefined ? (body.stats as any) : oldSlider.stats,
        order: body.order !== undefined ? parseIntSafe(body.order) : oldSlider.order,
        isActive: body.isActive !== undefined ? body.isActive : oldSlider.isActive,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "UPDATE",
        entity: "SliderItem",
        entityId: id,
        oldData: oldSlider as object,
        newData: updatedSlider as object,
      },
    });

    logger.dbOperation("UPDATE", "SliderItem", { id });
    logger.apiRequest("PUT", `/api/sliders/${id}`, 200, Date.now() - startTime);
    return apiSuccess(updatedSlider);
  } catch (error) {
    logger.error("Error updating slider", error, { path: `/api/sliders/[id]` });
    logger.apiRequest("PUT", `/api/sliders/[id]`, 500, Date.now() - startTime);
    return apiError("Slider güncellenemedi", 500);
  }
}

// DELETE - Slider sil (admin auth gerekli)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("DELETE", `/api/sliders/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;

    // Get old data for audit log
    const oldSlider = await prisma.sliderItem.findUnique({
      where: { id },
    });

    if (!oldSlider) {
      logger.apiRequest("DELETE", `/api/sliders/${id}`, 404, Date.now() - startTime);
      return apiError("Slider bulunamadı", 404);
    }

    // Hard delete - remove from database
    await prisma.sliderItem.delete({
      where: { id },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "DELETE",
        entity: "SliderItem",
        entityId: id,
        oldData: oldSlider as object,
      },
    });

    logger.dbOperation("DELETE", "SliderItem", { id });
    logger.apiRequest("DELETE", `/api/sliders/${id}`, 200, Date.now() - startTime);
    return apiSuccess({ message: "Slider silindi" });
  } catch (error) {
    logger.error("Error deleting slider", error, { path: `/api/sliders/[id]` });
    logger.apiRequest("DELETE", `/api/sliders/[id]`, 500, Date.now() - startTime);
    return apiError("Slider silinemedi", 500);
  }
}
