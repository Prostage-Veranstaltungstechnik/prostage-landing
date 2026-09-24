import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateInquiryStatus } from "@/lib/inquiries";
import type { InquiryStatus } from "@/types/inquiry";

const allowed = new Set<InquiryStatus>(["new", "in_progress", "done"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!allowed.has(body.status)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }
  const { id } = await params;
  const updated = await updateInquiryStatus(Number(id), body.status);
  if (!updated) return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
  return NextResponse.json({ success: true });
}
