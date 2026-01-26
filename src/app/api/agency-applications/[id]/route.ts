import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET - Tek bir acente başvurusunu getir
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

        const application = await prisma.agencyApplication.findUnique({
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
        logger.error("Error fetching agency application:", error);
        return NextResponse.json(
            { error: "Başvuru yüklenemedi" },
            { status: 500 }
        );
    }
}

// PUT - Acente başvurusunu güncelle
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

        const application = await prisma.agencyApplication.update({
            where: { id },
            data: {
                status: body.status,
                notes: body.notes,
            },
        });

        logger.info(`Agency application ${id} updated`);

        return NextResponse.json(application);
    } catch (error) {
        logger.error("Error updating agency application:", error);
        return NextResponse.json(
            { error: "Başvuru güncellenemedi" },
            { status: 500 }
        );
    }
}

// DELETE - Acente başvurusunu sil
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

        await prisma.agencyApplication.delete({
            where: { id },
        });

        logger.info(`Agency application ${id} deleted`);

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Error deleting agency application:", error);
        return NextResponse.json(
            { error: "Başvuru silinemedi" },
            { status: 500 }
        );
    }
}
