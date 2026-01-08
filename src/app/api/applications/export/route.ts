import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Excel export için tüm başvuruları getir
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
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    
    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // CSV formatına dönüştür
    const statusMap: Record<string, string> = {
      PENDING: "Beklemede",
      CONTACTED: "İletişime Geçildi",
      PROCESSING: "İşleniyor",
      APPROVED: "Onaylandı",
      REJECTED: "Reddedildi",
      COMPLETED: "Tamamlandı",
    };

    const headers = [
      "ID",
      "Ad Soyad",
      "TC Kimlik",
      "E-posta",
      "Telefon",
      "İl",
      "İlçe",
      "Adres",
      "Plaka",
      "Marka",
      "Model",
      "Yıl",
      "Paket",
      "Fiyat",
      "Durum",
      "Notlar",
      "Başvuru Tarihi",
    ];

    const rows = applications.map((app) => [
      app.id,
      app.fullName,
      app.tcNo,
      app.email,
      app.phone,
      app.city,
      app.district,
      app.address || "",
      app.plate,
      app.brand,
      app.model || "",
      app.year || "",
      app.packageName,
      app.packagePrice ? `₺${app.packagePrice}` : "",
      statusMap[app.status] || app.status,
      app.notes || "",
      new Date(app.createdAt).toLocaleString("tr-TR"),
    ]);

    // CSV oluştur
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="basvurular_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting applications:", error);
    return NextResponse.json(
      { error: "Dışa aktarma başarısız" },
      { status: 500 }
    );
  }
}
