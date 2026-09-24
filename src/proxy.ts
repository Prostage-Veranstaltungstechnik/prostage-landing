import { NextResponse, type NextRequest } from "next/server";
import { getMaintenanceMode } from "@/lib/site-settings";

export async function proxy(request: NextRequest) {
  try {
    if (await getMaintenanceMode()) {
      const maintenanceUrl = new URL("/wartung", request.url);
      return NextResponse.redirect(maintenanceUrl, 307);
    }
  } catch (error) {
    console.error("Maintenance proxy check failed", error);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|admin|wartung|_next/static|_next/image|favicon.ico|icon|apple-icon|logo.png|products/).*)",
  ],
};
