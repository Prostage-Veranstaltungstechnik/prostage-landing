import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getMaintenanceMode, setMaintenanceMode } from "@/lib/site-settings";

function unauthorized() {
  return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    return NextResponse.json({ enabled: await getMaintenanceMode() });
  } catch (error) {
    console.error("Maintenance status GET failed", error);
    return NextResponse.json({ error: "Website-Status konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "Ungültiger Website-Status." }, { status: 400 });
    }
    return NextResponse.json({ enabled: await setMaintenanceMode(body.enabled) });
  } catch (error) {
    console.error("Maintenance status PUT failed", error);
    return NextResponse.json({ error: "Website-Status konnte nicht gespeichert werden." }, { status: 500 });
  }
}
