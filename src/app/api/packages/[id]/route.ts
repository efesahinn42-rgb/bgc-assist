import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, generateSlug, parseIntSafe } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import type { UpdatePackageRequest } from "@/types/api";

// GET - Tek paket getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;

    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      logger.apiRequest("GET", `/api/packages/${id}`, 404, Date.now() - startTime);
      return apiError("Paket bulunamadı", 404);
    }

    logger.apiRequest("GET", `/api/packages/${id}`, 200, Date.now() - startTime);
    return apiSuccess(pkg);
  } catch (error) {
    logger.error("Error fetching package", error, { path: `/api/packages/[id]` });
    logger.apiRequest("GET", `/api/packages/[id]`, 500, Date.now() - startTime);
    return apiError("Paket yüklenemedi", 500);
  }
}

// PUT - Paket güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("PUT", `/api/packages/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;
    const body = (await request.json()) as UpdatePackageRequest;

    // Get old data for audit log
    const oldPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!oldPackage) {
      logger.apiRequest("PUT", `/api/packages/${id}`, 404, Date.now() - startTime);
      return apiError("Paket bulunamadı", 404);
    }

    // Update slug if name changed
    let slug = oldPackage.slug;
    if (body.name && body.name !== oldPackage.name) {
      slug = generateSlug(body.name);
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name: body.name ?? oldPackage.name,
        slug,
        price: body.price !== undefined ? parseIntSafe(body.price) : oldPackage.price,
        period: body.period ?? oldPackage.period,
        description: body.description ?? oldPackage.description,
        icon: body.icon ?? oldPackage.icon,
        popular: body.popular ?? oldPackage.popular,
        color: body.color ?? oldPackage.color,
        features: (body.features as Prisma.InputJsonValue) ?? oldPackage.features,
        notIncluded: (body.notIncluded as Prisma.InputJsonValue) ?? oldPackage.notIncluded,
        order: body.order ?? oldPackage.order,
        isActive: body.isActive ?? oldPackage.isActive,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "UPDATE",
        entity: "Package",
        entityId: id,
        oldData: oldPackage as object,
        newData: updatedPackage as object,
      },
    });

    logger.dbOperation("UPDATE", "Package", { id });
    logger.apiRequest("PUT", `/api/packages/${id}`, 200, Date.now() - startTime);
    return apiSuccess(updatedPackage);
  } catch (error) {
    logger.error("Error updating package", error, { path: `/api/packages/[id]` });
    logger.apiRequest("PUT", `/api/packages/[id]`, 500, Date.now() - startTime);
    return apiError("Paket güncellenemedi", 500);
  }
}

// DELETE - Paket sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await auth();

    if (!session || !session.user) {
      logger.apiRequest("DELETE", `/api/packages/[id]`, 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const { id } = await params;

    // Get old data for audit log
    const oldPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!oldPackage) {
      logger.apiRequest("DELETE", `/api/packages/${id}`, 404, Date.now() - startTime);
      return apiError("Paket bulunamadı", 404);
    }

    // Soft delete - just mark as inactive
    await prisma.package.update({
      where: { id },
      data: { isActive: false },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as { id: string }).id,
        action: "DELETE",
        entity: "Package",
        entityId: id,
        oldData: oldPackage as object,
      },
    });

    logger.dbOperation("DELETE", "Package", { id });
    logger.apiRequest("DELETE", `/api/packages/${id}`, 200, Date.now() - startTime);
    return apiSuccess({ message: "Paket silindi" });
  } catch (error) {
    logger.error("Error deleting package", error, { path: `/api/packages/[id]` });
    logger.apiRequest("DELETE", `/api/packages/[id]`, 500, Date.now() - startTime);
    return apiError("Paket silinemedi", 500);
  }
}
