import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "src/data/products.json");

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await fs.readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(data);

    const index = products.findIndex((p: { id: string }) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    }

    products.splice(index, 1);
    await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fehler beim Löschen des Produkts." }, { status: 500 });
  }
}
