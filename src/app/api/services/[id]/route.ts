import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import type { UpdateServiceRequest } from "@/types/api";

// GET - Tek hizmet getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      logger.apiRequest("GET", `/api/services/${id}`, 404, Date.now() - startTime);
      return apiError("Hizmet bulunamadı", 404);
    }

    logger.apiRequest("GET", `/api/services/${id}`, 200, Date.now() - startTime);
    return apiSuccess(service);
  } catch (error) {
    logger.error("Error fetching service", error, { path: `/api/services/[id]` });
    logger.apiRequest("GET", `/api/services/[id]`, 500, Date.now() - startTime);
    return apiError("Hizmet yüklenemedi", 500);
  }
}

// PUT - Hizmet güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("PUT", `/api/services/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateServiceRequest;

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      logger.apiRequest("PUT", `/api/services/${id}`, 404, Date.now() - startTime);
      return apiError("Hizmet bulunamadı", 404);
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: body.title ?? existingService.title,
        description: body.description ?? existingService.description,
        icon: body.icon ?? existingService.icon,
        color: body.color ?? existingService.color,
        modalImage: body.modalImage ?? existingService.modalImage,
        modalDescription: body.modalDescription ?? existingService.modalDescription,
        interventionTime: body.interventionTime ?? existingService.interventionTime,
        coverageArea: body.coverageArea ?? existingService.coverageArea,
        featuresList: (body.featuresList as Prisma.InputJsonValue) ?? existingService.featuresList,
        order: body.order ?? existingService.order,
        isActive: body.isActive ?? existingService.isActive,
      },
    });

    logger.dbOperation("UPDATE", "Service", { id });
    logger.apiRequest("PUT", `/api/services/${id}`, 200, Date.now() - startTime);
    return apiSuccess(updatedService);
  } catch (error) {
    logger.error("Error updating service", error, { path: `/api/services/[id]` });
    logger.apiRequest("PUT", `/api/services/[id]`, 500, Date.now() - startTime);
    return apiError("Hizmet güncellenemedi", 500);
  }
}

// DELETE - Hizmet sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("DELETE", `/api/services/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      logger.apiRequest("DELETE", `/api/services/${id}`, 404, Date.now() - startTime);
      return apiError("Hizmet bulunamadı", 404);
    }

    await prisma.service.delete({
      where: { id },
    });

    logger.dbOperation("DELETE", "Service", { id });
    logger.apiRequest("DELETE", `/api/services/${id}`, 200, Date.now() - startTime);
    return apiSuccess({ message: "Hizmet silindi" });
  } catch (error) {
    logger.error("Error deleting service", error, { path: `/api/services/[id]` });
    logger.apiRequest("DELETE", `/api/services/[id]`, 500, Date.now() - startTime);
    return apiError("Hizmet silinemedi", 500);
  }
}
