import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

// Cache configuration: revalidate every 3600 seconds (1 hour) - settings change infrequently
export const revalidate = 3600;

// Default settings for fallback
const defaultSettings: Record<string, string> = {
  phone: "0850 888 0 155",
  email: "info@bgcfilo.com.tr",
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
  const startTime = Date.now();
  try {
    const settings = await prisma.siteSetting.findMany();
    
    // Convert array to object
    const settingsObj: Record<string, string> = { ...defaultSettings };
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    logger.apiRequest("GET", "/api/settings", 200, Date.now() - startTime);
    return apiSuccess(settingsObj);
  } catch (error) {
    logger.error("Error fetching settings", error, { path: "/api/settings" });
    logger.apiRequest("GET", "/api/settings", 500, Date.now() - startTime);
    // Return defaults if database is not available
    return apiSuccess(defaultSettings);
  }
}

// PUT - Update settings (admin only)
export async function PUT(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      logger.apiRequest("PUT", "/api/settings", 401, Date.now() - startTime);
      return apiError("Yetkisiz erişim", 401);
    }

    const body = (await req.json()) as Record<string, unknown>;

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

    logger.dbOperation("UPDATE", "SiteSetting", { count: updates.length });
    logger.apiRequest("PUT", "/api/settings", 200, Date.now() - startTime);
    return apiSuccess({ success: true, message: "Ayarlar güncellendi" });
  } catch (error) {
    logger.error("Error updating settings", error, { path: "/api/settings" });
    logger.apiRequest("PUT", "/api/settings", 500, Date.now() - startTime);
    return apiError("Ayarlar güncellenirken bir hata oluştu", 500);
  }
}
