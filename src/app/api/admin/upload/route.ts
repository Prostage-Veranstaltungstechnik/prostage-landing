import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getImagesDir } from "@/lib/products";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json(
        { error: "Datei und Produkt-ID sind erforderlich." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nur JPEG, PNG, WebP und GIF Dateien sind erlaubt." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Datei darf maximal 10MB groß sein." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const filename = `${productId}.${sanitizedExt}`;

    const imagesDir = getImagesDir();
    await fs.mkdir(imagesDir, { recursive: true });

    // Remove any existing image for this product
    try {
      const files = await fs.readdir(imagesDir);
      for (const f of files) {
        if (f.startsWith(`${productId}.`)) {
          await fs.unlink(path.join(imagesDir, f));
        }
      }
    } catch {
      // directory may not exist yet
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(imagesDir, filename), buffer);

    const imageUrl = `/api/images/${filename}`;
    return NextResponse.json({ url: imageUrl, filename });
  } catch {
    return NextResponse.json({ error: "Fehler beim Hochladen." }, { status: 500 });
  }
}
