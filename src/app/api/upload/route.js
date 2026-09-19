import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // File size validation (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image file exceeds maximum allowed size of 5MB." },
        { status: 400 }
      );
    }

    // MIME type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, WEBP, AVIF, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Use server-side private key (fallback to NEXT_PUBLIC if not yet migrated)
    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Image storage service is not configured." },
        { status: 500 }
      );
    }

    const imgbbForm = new FormData();
    imgbbForm.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbForm,
    });

    const data = await response.json();

    if (data.success && data.data?.url) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
      });
    }

    return NextResponse.json(
      { success: false, error: data.error?.message || "Failed to upload image." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}
