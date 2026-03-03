import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "src/data/products.json");

async function readProducts() {
  const data = await fs.readFile(PRODUCTS_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeProducts(products: unknown[]) {
  await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
}

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Fehler beim Laden der Produkte." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description } = body;

    if (!name || !category || !description) {
      return NextResponse.json(
        { error: "Name, Kategorie und Beschreibung sind erforderlich." },
        { status: 400 }
      );
    }

    const categoryLabels: Record<string, string> = {
      ton: "Tontechnik",
      licht: "Lichttechnik",
      buehne: "Bühnentechnik",
      video: "Video",
    };

    const products = await readProducts();

    const id = name
      .toLowerCase()
      .replace(/[äÄ]/g, "ae")
      .replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue")
      .replace(/[ß]/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newProduct = {
      id,
      name,
      category,
      categoryLabel: categoryLabels[category] || category,
      description,
      price: "Auf Anfrage",
      unit: "/Tag",
      specs: {},
      availability: "Verfügbar",
    };

    products.push(newProduct);
    await writeProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Fehler beim Erstellen des Produkts." }, { status: 500 });
  }
}
