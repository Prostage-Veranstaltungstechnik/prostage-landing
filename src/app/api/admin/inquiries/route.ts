import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { readInquiries } from "@/lib/inquiries";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  try {
    return NextResponse.json(await readInquiries());
  } catch (error) {
    console.error("Admin inquiries GET failed", error);
    return NextResponse.json({ error: "Fehler beim Laden der Anfragen." }, { status: 500 });
  }
}
