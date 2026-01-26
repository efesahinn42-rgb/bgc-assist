import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { validateRequired, validatePhone, validateEmail } from "@/lib/validation";

// Service type labels for supplier applications
export const serviceTypeLabels: Record<string, string> = {
    OTO_KURTARMA: "Oto Kurtarma",
    OTO_KIRALAMA: "Oto Kiralama",
    OTO_LASTIKCI: "Oto Lastikçi",
    CILINGIR: "Çilingir",
};

// GET - Tüm tedarikçi başvurularını getir (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status");
        const serviceType = searchParams.get("serviceType");
        const search = searchParams.get("search");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};

        if (status && status !== "all") {
            where.status = status;
        }

        if (serviceType && serviceType !== "all") {
            where.serviceType = serviceType;
        }

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: "insensitive" } },
                { authorizedName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { city: { contains: search, mode: "insensitive" } },
            ];
        }

        const [applications, total] = await Promise.all([
            prisma.supplierApplication.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.supplierApplication.count({ where }),
        ]);

        // Get statistics
        const [totalCount, pendingCount, approvedCount] = await Promise.all([
            prisma.supplierApplication.count(),
            prisma.supplierApplication.count({ where: { status: "PENDING" } }),
            prisma.supplierApplication.count({ where: { status: "APPROVED" } }),
        ]);

        return NextResponse.json({
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            statistics: {
                total: totalCount,
                pendingCount,
                approvedCount,
            },
        });
    } catch (error) {
        logger.error("Error fetching supplier applications:", error);
        return NextResponse.json(
            { error: "Başvurular yüklenemedi" },
            { status: 500 }
        );
    }
}

// POST - Yeni tedarikçi başvurusu oluştur (public)
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ["companyName", "serviceType", "authorizedName", "phone", "city", "district"];
        const requiredValidation = validateRequired(body, requiredFields);

        if (!requiredValidation.isValid) {
            logger.apiRequest("POST", "/api/supplier-applications", 400, Date.now() - startTime);
            return apiError(requiredValidation.error || "Gerekli alanlar eksik", 400);
        }

        // Validate phone
        const phoneValidation = validatePhone(body.phone);
        if (!phoneValidation.isValid) {
            logger.apiRequest("POST", "/api/supplier-applications", 400, Date.now() - startTime);
            return apiError(phoneValidation.error || "Geçersiz telefon numarası", 400);
        }

        // Validate email if provided
        if (body.email) {
            const emailValidation = validateEmail(body.email);
            if (!emailValidation.isValid) {
                logger.apiRequest("POST", "/api/supplier-applications", 400, Date.now() - startTime);
                return apiError(emailValidation.error || "Geçersiz email adresi", 400);
            }
        }

        // Validate service type
        const validServiceTypes = Object.keys(serviceTypeLabels);
        if (!validServiceTypes.includes(body.serviceType)) {
            logger.apiRequest("POST", "/api/supplier-applications", 400, Date.now() - startTime);
            return apiError("Geçersiz hizmet türü", 400);
        }

        // Create application
        const application = await prisma.supplierApplication.create({
            data: {
                companyName: body.companyName,
                serviceType: body.serviceType,
                authorizedName: body.authorizedName,
                email: body.email || null,
                phone: body.phone,
                city: body.city,
                district: body.district,
                address: body.address || null,
                vehicleCount: body.vehicleCount ? parseInt(body.vehicleCount) : null,
                notes: body.notes || null,
            },
        });

        logger.info(`New supplier application created: ${application.id}`);

        return apiSuccess(
            {
                success: true,
                message: "Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
                applicationId: application.id,
            },
            201
        );
    } catch (error) {
        logger.error("Error creating supplier application:", error);
        return apiError("Başvuru oluşturulamadı. Lütfen tekrar deneyin.", 500);
    }
}
