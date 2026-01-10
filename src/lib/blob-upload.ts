import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  url: string;
  success: boolean;
  error?: string;
}

export async function uploadImage(
  file: File,
  folder: string = "sliders"
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: "",
        success: false,
        error: "Sadece JPG, PNG ve WebP formatları desteklenmektedir.",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: "",
        success: false,
        error: "Dosya boyutu 5MB'dan büyük olamaz.",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return {
      url: blob.url,
      success: true,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      url: "",
      success: false,
      error: "Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
