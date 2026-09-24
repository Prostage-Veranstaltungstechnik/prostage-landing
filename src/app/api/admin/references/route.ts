import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createReference, readReferences } from "@/lib/references";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    return NextResponse.json(await readReferences({ includeHidden: true }));
  } catch (error) {
    console.error("Admin references GET failed", error);
    return NextResponse.json({ error: "Referenzen konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const description = String(body.description || "").trim();
    const location = String(body.location || "").trim();
    const eventDate = String(body.eventDate || "");
    const image = String(body.image || "").trim();
    if (!title || title.length > 255 || !type || type.length > 120 || !description || description.length > 5000 || !location || location.length > 255 || !DATE.test(eventDate) || !image) {
      return NextResponse.json({ error: "Titel, Art, Ort, Datum, Beschreibung und Bild sind erforderlich." }, { status: 400 });
    }
    const entry = await createReference({
      title, type, description, location, eventDate, image,
      visible: body.visible !== false,
      sortOrder: 0,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Admin reference POST failed", error);
    return NextResponse.json({ error: "Referenz konnte nicht angelegt werden." }, { status: 500 });
  }
}
