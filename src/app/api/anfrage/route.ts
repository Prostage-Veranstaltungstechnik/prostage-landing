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
import { readProducts } from "@/lib/products";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_SERVICES = new Set(["fullservice", "tontechnik", "lichttechnik", "vermietung"]);

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 1_000_000) {
    return NextResponse.json({ error: "Anfrage ist zu groß." }, { status: 413 });
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

    const ipLimit = await checkRateLimit(request, "rental-ip", 5, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const message = String(body.nachricht || "").trim();
    const products = Array.isArray(body.produkte) ? body.produkte : [];
    const services = Array.isArray(body.leistungen)
      ? body.leistungen.map(String).filter((service: string) => ALLOWED_SERVICES.has(service))
      : [];
    const rentalFrom = String(body.von || "");
    const rentalTo = String(body.bis || "");

    if (!name || name.length > 255 || !EMAIL.test(email) || email.length > 320 || message.length > 10000 || !DATE.test(rentalFrom) || !DATE.test(rentalTo) || (!message && products.length === 0)) {
      return NextResponse.json({ error: "Bitte prüfen Sie alle Pflichtfelder." }, { status: 400 });
    }
    if (rentalFrom > rentalTo) {
      return NextResponse.json({ error: "Der Mietzeitraum ist ungültig." }, { status: 400 });
    }
    if (hasSuspiciousContent(message)) {
      return NextResponse.json({ error: "Die Nachricht enthält zu viele Links." }, { status: 400 });
    }

    const requestedIds = new Set(
      products.slice(0, 100).map((product: Record<string, unknown>) => String(product.id || ""))
    );
    const safeProducts = (await readProducts())
      .filter((product) => requestedIds.has(product.id))
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        categoryLabel: product.categoryLabel,
      }));
    if (!message && safeProducts.length === 0) {
      return NextResponse.json({ error: "Bitte wählen Sie mindestens ein gültiges Produkt aus." }, { status: 400 });
    }

    const emailLimit = await checkRateLimit(request, "rental-email", 3, 30 * 60 * 1000, email);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }
    const unique = await claimSubmissionFingerprint("rental", [
      email,
      message.toLowerCase(),
      rentalFrom,
      rentalTo,
      safeProducts.map((product) => product.id).sort(),
    ]);
    if (!unique) {
      return NextResponse.json({ error: "Diese Anfrage wurde bereits gesendet." }, { status: 409 });
    }

    const inquiry = {
      kind: "rental" as const,
      name,
      email,
      phone: String(body.telefon || "").trim(),
      message: message || "Mietanfrage zu den ausgewählten Produkten",
      rentalFrom,
      rentalTo,
      services,
      products: safeProducts,
    };
    const id = await createInquiry(inquiry);
    let mailSent = false;
    try {
      mailSent = await sendInquiryMail(inquiry);
      if (mailSent) await markInquiryMailSent(id);
    } catch (mailError) {
      console.error("Rental inquiry email failed", mailError);
    }

    return NextResponse.json({ success: true, id, mailSent }, { status: 201 });
  } catch (error) {
    console.error("Rental inquiry failed", error);
    return NextResponse.json({ error: "Anfrage konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
