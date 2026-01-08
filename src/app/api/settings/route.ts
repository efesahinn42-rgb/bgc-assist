import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Default settings for fallback
const defaultSettings: Record<string, string> = {
  phone: "0530 232 27 42",
  email: "info@bgcassist.com",
  whatsapp: "905302322742",
  address: "Akabe, Şht. Furkan Doğan Cd. Bey Plaza Kat:1 No:3/122, 42020 Karatay/Konya",
  city: "Konya",
  workingHours: "Açık · Kapanış saati: 19:00",
  instagram: "",
  twitter: "",
  facebook: "",
  linkedin: "",
  website: "https://bgcassist.com",
};

// GET - Fetch all settings (public endpoint)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    
    // Convert array to object
    const settingsObj: Record<string, string> = { ...defaultSettings };
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults if database is not available
    return NextResponse.json(defaultSettings);
  }
}

// PUT - Update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();

    // Upsert each setting
    const updates = Object.entries(body).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value), updatedAt: new Date() },
        create: {
          key,
          value: String(value),
          type: "text",
          group: "contact",
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Ayarlar güncellendi" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
