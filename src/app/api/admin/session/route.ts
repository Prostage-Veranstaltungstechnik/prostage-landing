import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminAuthConfigured,
  adminCookieOptions,
  createAdminSession,
  isAdminAuthenticated,
  passwordMatches,
} from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated(), configured: adminAuthConfigured() });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 8_192) {
    return NextResponse.json({ error: "Anfrage ist zu groß." }, { status: 413 });
  }
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin-Zugang ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const key = clientKey(request);
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= 5) {
    return NextResponse.json(
      { error: "Zu viele Anmeldeversuche. Bitte später erneut versuchen." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || !passwordMatches(body.password)) {
    attempts.set(key, {
      count: current && current.resetAt > now ? current.count + 1 : 1,
      resetAt: current && current.resetAt > now ? current.resetAt : now + 15 * 60 * 1000,
    });
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
