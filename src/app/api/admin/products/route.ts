import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createProduct, readProducts } from "@/lib/products";
import { CATEGORY_OPTIONS } from "@/types/product";

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    return NextResponse.json(await readProducts({ includeHidden: true }));
  } catch (error) {
    console.error("Admin products GET failed", error);
    return NextResponse.json({ error: "Fehler beim Laden der Produkte." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const body = await request.json();
    const validCategory = CATEGORY_OPTIONS.some((category) => category.key === body.category);
    if (!body.name?.trim() || !validCategory || !body.description?.trim()) {
      return NextResponse.json(
        { error: "Name, Kategorie und Beschreibung sind erforderlich." },
        { status: 400 }
      );
    }
    body.isSet = Boolean(body.isSet);
    body.visible = body.visible !== false;
    body.setItems = body.isSet && Array.isArray(body.setItems) ? body.setItems : [];
    if (body.isSet && body.setItems.length === 0) {
      return NextResponse.json({ error: "Ein Set muss mindestens ein Produkt enthalten." }, { status: 400 });
    }
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Admin product POST failed", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Produkts." }, { status: 500 });
  }
}
