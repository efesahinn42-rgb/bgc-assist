import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/blob-upload";

// POST - Image upload endpoint (admin auth gerekli)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    const result = await uploadImage(file, "sliders");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Resim yüklenemedi" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: result.url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Resim yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
