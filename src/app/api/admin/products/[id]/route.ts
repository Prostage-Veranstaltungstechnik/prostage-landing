import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteProduct, findProduct, getImagesDir, updateProduct } from "@/lib/products";
import { CATEGORY_OPTIONS } from "@/types/product";

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.category && !CATEGORY_OPTIONS.some((category) => category.key === body.category)) {
      return NextResponse.json({ error: "Ungültige Kategorie." }, { status: 400 });
    }
    if (body.isSet === true && (!Array.isArray(body.setItems) || body.setItems.length === 0)) {
      return NextResponse.json({ error: "Ein Set muss mindestens ein Produkt enthalten." }, { status: 400 });
    }
    const product = await updateProduct(id, body);
    if (!product) return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Admin product PUT failed", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Produkts." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const product = await findProduct(id);
    if (!product) return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    const deleted = await deleteProduct(id);
    if (deleted && product.image) {
      const filename = path.basename(product.image);
      await fs.unlink(path.join(getImagesDir(), filename)).catch(() => undefined);
    }
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Admin product DELETE failed", error);
    return NextResponse.json({ error: "Fehler beim Löschen des Produkts." }, { status: 500 });
  }
}
