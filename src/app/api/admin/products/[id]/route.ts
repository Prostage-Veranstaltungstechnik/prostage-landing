import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readProducts, writeProducts, getImagesDir } from "@/lib/products";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = await readProducts();

    const index = products.findIndex((p: Product) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden." },
        { status: 404 }
      );
    }

    const existing = products[index];
    const category = body.category ?? existing.category;
    const categoryLabel =
      body.category !== undefined
        ? CATEGORY_LABELS[body.category] || body.category
        : existing.categoryLabel;

    const updated: Product = {
      ...existing,
      name: body.name ?? existing.name,
      category,
      categoryLabel,
      description: body.description ?? existing.description,
      price: body.price ?? existing.price,
      unit: body.unit ?? existing.unit,
      specs: body.specs ?? existing.specs,
      availability: body.availability ?? existing.availability,
      featured: body.featured ?? existing.featured,
      sortOrder: body.sortOrder ?? existing.sortOrder,
      image: body.image !== undefined ? body.image : existing.image,
    };

    products[index] = updated;
    await writeProducts(products);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Produkts." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await readProducts();

    const index = products.findIndex((p: Product) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden." },
        { status: 404 }
      );
    }

    // Delete associated image if exists
    const product = products[index];
    if (product.image) {
      const filename = product.image.split("/").pop();
      if (filename) {
        try {
          await fs.unlink(path.join(getImagesDir(), filename));
        } catch {
          // Image file may not exist
        }
      }
    }

    products.splice(index, 1);
    await writeProducts(products);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Produkts." },
      { status: 500 }
    );
  }
}
