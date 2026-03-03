import { NextResponse } from "next/server";
import { readProducts, writeProducts, generateId } from "@/lib/products";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Laden der Produkte." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description, price, unit, availability, featured, specs, image } = body;

    if (!name || !category || !description) {
      return NextResponse.json(
        { error: "Name, Kategorie und Beschreibung sind erforderlich." },
        { status: 400 }
      );
    }

    const products = await readProducts();

    let id = generateId(name);
    if (products.some((p: Product) => p.id === id)) {
      id = `${id}-${Date.now()}`;
    }

    const maxOrder = products.reduce(
      (max, p) => Math.max(max, p.sortOrder ?? 0),
      -1
    );

    const newProduct: Product = {
      id,
      name,
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      description,
      price: price || "Auf Anfrage",
      unit: unit || "/Tag",
      specs: specs || {},
      availability: availability || "Verfügbar",
      featured: featured ?? false,
      sortOrder: maxOrder + 1,
      image: image || null,
    };

    products.push(newProduct);
    await writeProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Produkts." },
      { status: 500 }
    );
  }
}
