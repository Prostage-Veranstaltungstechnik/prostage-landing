import { NextResponse } from "next/server";
import { readReferences } from "@/lib/references";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readReferences());
  } catch (error) {
    console.error("References GET failed", error);
    return NextResponse.json({ error: "Referenzen konnten nicht geladen werden." }, { status: 503 });
  }
}
