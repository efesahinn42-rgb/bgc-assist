import { NextResponse } from "next/server";
import { cities } from "@/lib/cities-data";

// GET - Tüm illeri getir
export async function GET() {
  try {
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "İller yüklenemedi" },
      { status: 500 }
    );
  }
}
