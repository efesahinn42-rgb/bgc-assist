import { NextRequest, NextResponse } from "next/server";
import { getDistrictsByCity } from "@/lib/districts-data";

// GET - İlçeleri getir (query param: city)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "İl parametresi gerekli" },
        { status: 400 }
      );
    }

    const districts = getDistrictsByCity(city);
    return NextResponse.json({ districts });
  } catch (error) {
    console.error("Error fetching districts:", error);
    return NextResponse.json(
      { error: "İlçeler yüklenemedi" },
      { status: 500 }
    );
  }
}
