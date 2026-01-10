import { NextResponse } from "next/server";
import { vehicleBrandCategories } from "@/lib/vehicle-brands-data";

// GET - Kategorize edilmiş markaları getir
export async function GET() {
  try {
    return NextResponse.json({ categories: vehicleBrandCategories });
  } catch (error) {
    console.error("Error fetching vehicle brands:", error);
    return NextResponse.json(
      { error: "Markalar yüklenemedi" },
      { status: 500 }
    );
  }
}
