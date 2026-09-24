import { NextResponse } from "next/server";
import { createInquiry, markInquiryMailSent } from "@/lib/inquiries";
import { sendInquiryMail } from "@/lib/mailer";
import {
  checkRateLimit,
  claimSubmissionFingerprint,
  hasSuspiciousContent,
  isBotSubmission,
  isCrossSiteRequest,
} from "@/lib/spam-protection";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 100_000) {
    return NextResponse.json({ error: "Nachricht ist zu groß." }, { status: 413 });
  }
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (String(body.website || "").trim()) {
      return NextResponse.json({ success: true, mailSent: true }, { status: 201 });
    }
    if (isBotSubmission(body)) {
      return NextResponse.json({ error: "Bitte laden Sie das Formular neu und versuchen Sie es erneut." }, { status: 400 });
    }

    const ipLimit = await checkRateLimit(request, "contact-ip", 5, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Nachrichten. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }
    const inquiry = {
      kind: "contact" as const,
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      phone: String(body.phone || "").trim(),
      subject: String(body.subject || "").trim() || "Allgemeine Kontaktanfrage",
      message: String(body.message || "").trim(),
    };
    if (
      !inquiry.name ||
      inquiry.name.length > 255 ||
      !EMAIL.test(inquiry.email) ||
      inquiry.email.length > 320 ||
      inquiry.phone.length > 80 ||
      inquiry.subject.length > 255 ||
      !inquiry.message ||
      inquiry.message.length > 10000
    ) {
      return NextResponse.json({ error: "Bitte prüfen Sie alle Pflichtfelder." }, { status: 400 });
    }
    if (hasSuspiciousContent(inquiry.subject, inquiry.message)) {
      return NextResponse.json({ error: "Die Nachricht enthält zu viele Links." }, { status: 400 });
    }

    const emailLimit = await checkRateLimit(request, "contact-email", 3, 30 * 60 * 1000, inquiry.email);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Nachrichten. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }
    const unique = await claimSubmissionFingerprint("contact", [
      inquiry.email,
      inquiry.subject.toLowerCase(),
      inquiry.message.toLowerCase(),
    ]);
    if (!unique) {
      return NextResponse.json({ error: "Diese Nachricht wurde bereits gesendet." }, { status: 409 });
    }

    const id = await createInquiry(inquiry);
    let mailSent = false;
    try {
      mailSent = await sendInquiryMail(inquiry);
      if (mailSent) await markInquiryMailSent(id);
    } catch (mailError) {
      console.error("Contact inquiry email failed", mailError);
    }
    return NextResponse.json({ success: true, id, mailSent }, { status: 201 });
  } catch (error) {
    console.error("Contact inquiry failed", error);
    return NextResponse.json({ error: "Nachricht konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
