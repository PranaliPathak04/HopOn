import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload
// Accepts a base64 image string + a "folder" tag (profile / license / rc)
// Uploads to Cloudinary and returns the secure URL.
// Auth required — only logged-in users can upload.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "You must be logged in" },
      { status: 401 },
    );
  }

  const { image, folder } = await req.json();

  if (!image) {
    return NextResponse.json(
      { success: false, message: "No image provided" },
      { status: 400 },
    );
  }

  const allowedFolders = ["profile", "license", "rc"];
  const targetFolder = allowedFolders.includes(folder) ? folder : "misc";

  try {
    const userId = (session.user as any).id;

    const result = await cloudinary.uploader.upload(image, {
      folder: `hopon/${targetFolder}`,
      public_id: `${userId}-${Date.now()}`,
      overwrite: true,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // cap size, keep aspect
        { quality: "auto:good" },
      ],
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
