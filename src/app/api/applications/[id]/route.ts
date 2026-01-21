import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { ApplicationStatus } from "@prisma/client";
import type { UpdateApplicationRequest } from "@/types/api";

// GET - Tek başvuru getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      logger.apiRequest("GET", `/api/applications/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;
    
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      logger.apiRequest("GET", `/api/applications/${id}`, 404, Date.now() - startTime);
      return apiError("Başvuru bulunamadı", 404);
    }

    logger.apiRequest("GET", `/api/applications/${id}`, 200, Date.now() - startTime);
    return apiSuccess(application);
  } catch (error) {
    logger.error("Error fetching application", error, { path: `/api/applications/[id]` });
    logger.apiRequest("GET", `/api/applications/[id]`, 500, Date.now() - startTime);
    return apiError("Başvuru yüklenemedi", 500);
  }
}

// PUT - Başvuru güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      logger.apiRequest("PUT", `/api/applications/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateApplicationRequest;

    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      logger.apiRequest("PUT", `/api/applications/${id}`, 404, Date.now() - startTime);
      return apiError("Başvuru bulunamadı", 404);
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: (body.status as ApplicationStatus) ?? existingApplication.status,
        notes: body.notes ?? existingApplication.notes,
        assignedTo: body.assignedTo ?? existingApplication.assignedTo,
      },
    });

    logger.dbOperation("UPDATE", "Application", { id });
    logger.apiRequest("PUT", `/api/applications/${id}`, 200, Date.now() - startTime);
    return apiSuccess(updatedApplication);
  } catch (error) {
    logger.error("Error updating application", error, { path: `/api/applications/[id]` });
    logger.apiRequest("PUT", `/api/applications/[id]`, 500, Date.now() - startTime);
    return apiError("Başvuru güncellenemedi", 500);
  }
}

// DELETE - Başvuru sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      logger.apiRequest("DELETE", `/api/applications/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;

    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      logger.apiRequest("DELETE", `/api/applications/${id}`, 404, Date.now() - startTime);
      return apiError("Başvuru bulunamadı", 404);
    }

    await prisma.application.delete({
      where: { id },
    });

    logger.dbOperation("DELETE", "Application", { id });
    logger.apiRequest("DELETE", `/api/applications/${id}`, 200, Date.now() - startTime);
    return apiSuccess({ message: "Başvuru silindi" });
  } catch (error) {
    logger.error("Error deleting application", error, { path: `/api/applications/[id]` });
    logger.apiRequest("DELETE", `/api/applications/[id]`, 500, Date.now() - startTime);
    return apiError("Başvuru silinemedi", 500);
  }
}
