import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getImagesDir } from "@/lib/products";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Sanitize filename to prevent path traversal
    const sanitized = path.basename(filename);
    if (sanitized !== filename || filename.includes("..")) {
      return NextResponse.json({ error: "Ungültiger Dateiname." }, { status: 400 });
    }

    const filePath = path.join(getImagesDir(), sanitized);
    const data = await fs.readFile(filePath);

    const ext = sanitized.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Bild nicht gefunden." }, { status: 404 });
  }
}
