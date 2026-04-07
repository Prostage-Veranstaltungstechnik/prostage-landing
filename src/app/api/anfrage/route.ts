import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, von, bis, nachricht } = body;

    if (!name || !email || !von || !bis || !nachricht) {
      return NextResponse.json(
        { error: "Bitte füllen Sie alle Pflichtfelder aus." },
        { status: 400 }
      );
    }

    const produkte = Array.isArray(body.produkte) ? body.produkte : [];

    // Log the inquiry (replace with email sending later)
    console.log("=== Neue Anfrage ===");
    console.log("Name:", name);
    console.log("E-Mail:", email);
    console.log("Telefon:", body.telefon || "–");
    console.log("Zeitraum:", von, "bis", bis);
    console.log("Leistungen:", (body.leistungen || []).join(", ") || "Keine ausgewählt");
    if (produkte.length > 0) {
      console.log("Ausgewählte Produkte:");
      produkte.forEach((p: { name: string; price: string; unit: string; categoryLabel: string }) => {
        console.log(`  - ${p.name} (${p.categoryLabel}) — ${p.price} ${p.unit}`);
      });
    }
    console.log("Nachricht:", nachricht || "–");
    console.log("====================");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der Anfrage." },
      { status: 500 }
    );
  }
}
