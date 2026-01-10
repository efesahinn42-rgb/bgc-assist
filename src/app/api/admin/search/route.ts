import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        applications: [],
        packages: [],
        services: [],
      });
    }

    const searchTerm = query.trim();

    // Search all in parallel
    const [applications, packages, services] = await Promise.all([
      // Search Applications
      prisma.application.findMany({
        where: {
          OR: [
            { fullName: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { plate: { contains: searchTerm, mode: "insensitive" } },
            { tcNo: { contains: searchTerm } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          plate: true,
          packageName: true,
          status: true,
          createdAt: true,
        },
      }),
      // Search Packages
      prisma.package.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          isActive: true,
        },
      }),
      // Search Services
      prisma.service.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      applications,
      packages,
      services,
    });
  } catch (error) {
    console.error("Error in global search:", error);
    return NextResponse.json(
      { error: "Arama yapılırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
