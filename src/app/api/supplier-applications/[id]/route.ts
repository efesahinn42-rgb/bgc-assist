import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET - Tek bir tedarikçi başvurusunu getir
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const application = await prisma.supplierApplication.findUnique({
            where: { id },
        });

        if (!application) {
            return NextResponse.json(
                { error: "Başvuru bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json(application);
    } catch (error) {
        logger.error("Error fetching supplier application:", error);
        return NextResponse.json(
            { error: "Başvuru yüklenemedi" },
            { status: 500 }
        );
    }
}

// PUT - Tedarikçi başvurusunu güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const application = await prisma.supplierApplication.update({
            where: { id },
            data: {
                status: body.status,
                notes: body.notes,
            },
        });

        logger.info(`Supplier application ${id} updated`);

        return NextResponse.json(application);
    } catch (error) {
        logger.error("Error updating supplier application:", error);
        return NextResponse.json(
            { error: "Başvuru güncellenemedi" },
            { status: 500 }
        );
    }
}

// DELETE - Tedarikçi başvurusunu sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.supplierApplication.delete({
            where: { id },
        });

        logger.info(`Supplier application ${id} deleted`);

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Error deleting supplier application:", error);
        return NextResponse.json(
            { error: "Başvuru silinemedi" },
            { status: 500 }
        );
    }
}
