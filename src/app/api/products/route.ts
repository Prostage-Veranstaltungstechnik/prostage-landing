import { NextResponse } from "next/server";
import { readProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readProducts());
  } catch (error) {
    console.error("Unable to load products", error);
    return NextResponse.json({ error: "Produkte konnten nicht geladen werden." }, { status: 503 });
  }
}
