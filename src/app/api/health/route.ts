import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mailConfigured } from "@/lib/mailer";
import { adminAuthConfigured } from "@/lib/auth";

export async function GET() {
  try {
    await db.query("SELECT 1");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      mail: mailConfigured() ? "configured" : "not_configured",
      admin: adminAuthConfigured() ? "configured" : "not_configured",
    });
  } catch {
    return NextResponse.json(
      { status: "error", database: "unavailable" },
      { status: 503 }
    );
  }
}
