import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteReference, findReference, updateReference } from "@/lib/references";
import { getImagesDir } from "@/lib/products";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Ungültige Referenz-ID." }, { status: 400 });
  try {
    const body = await request.json();
    const previous = await findReference(id);
    if (!previous) return NextResponse.json({ error: "Referenz nicht gefunden." }, { status: 404 });
    if (body.eventDate !== undefined && !DATE.test(String(body.eventDate))) {
      return NextResponse.json({ error: "Ungültiges Datum." }, { status: 400 });
    }
    for (const field of ["title", "type", "description", "location", "image"] as const) {
      if (body[field] !== undefined && !String(body[field]).trim()) {
        return NextResponse.json({ error: "Pflichtfelder dürfen nicht leer sein." }, { status: 400 });
      }
    }
    const entry = await updateReference(id, body);
    if (entry && body.image && previous.image !== entry.image && previous.image.startsWith("/api/images/")) {
      await fs.unlink(path.join(getImagesDir(), path.basename(previous.image))).catch(() => undefined);
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Admin reference PUT failed", error);
    return NextResponse.json({ error: "Referenz konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Ungültige Referenz-ID." }, { status: 400 });
  try {
    const entry = await findReference(id);
    if (!entry) return NextResponse.json({ error: "Referenz nicht gefunden." }, { status: 404 });
    const deleted = await deleteReference(id);
    if (deleted && entry.image.startsWith("/api/images/")) {
      await fs.unlink(path.join(getImagesDir(), path.basename(entry.image))).catch(() => undefined);
    }
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Admin reference DELETE failed", error);
    return NextResponse.json({ error: "Referenz konnte nicht gelöscht werden." }, { status: 500 });
  }
}
