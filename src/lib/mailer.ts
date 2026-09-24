import nodemailer from "nodemailer";

type MailProduct = {
  name?: string;
  price?: string;
  unit?: string;
  categoryLabel?: string;
};

type InquiryMail = {
  kind: "rental" | "contact";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  rentalFrom?: string;
  rentalTo?: string;
  services?: string[];
  products?: MailProduct[];
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendInquiryMail(inquiry: InquiryMail) {
  if (!mailConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const rental = inquiry.kind === "rental";
  const recipient = rental
    ? process.env.SALES_EMAIL || "sales@prostage.de"
    : process.env.INFO_EMAIL || "info@prostage.de";
  const title = rental ? "Neue Mietanfrage" : "Neue Kontaktanfrage";
  const productRows = (inquiry.products || [])
    .map((product) => `<li><strong>${escapeHtml(product.name)}</strong> – ${escapeHtml(product.price)} ${escapeHtml(product.unit)}</li>`)
    .join("");

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: recipient,
    replyTo: inquiry.email,
    subject: `${title}: ${inquiry.subject || inquiry.name}`,
    text: [
      title,
      `Name: ${inquiry.name}`,
      `E-Mail: ${inquiry.email}`,
      `Telefon: ${inquiry.phone || "–"}`,
      rental ? `Zeitraum: ${inquiry.rentalFrom} bis ${inquiry.rentalTo}` : "",
      inquiry.services?.length ? `Leistungen: ${inquiry.services.join(", ")}` : "",
      inquiry.products?.length ? `Produkte: ${inquiry.products.map((p) => p.name).join(", ")}` : "",
      "",
      inquiry.message,
    ].filter(Boolean).join("\n"),
    html: `
      <h2>${title}</h2>
      <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}<br>
      <strong>E-Mail:</strong> ${escapeHtml(inquiry.email)}<br>
      <strong>Telefon:</strong> ${escapeHtml(inquiry.phone || "–")}</p>
      ${rental ? `<p><strong>Zeitraum:</strong> ${escapeHtml(inquiry.rentalFrom)} bis ${escapeHtml(inquiry.rentalTo)}</p>` : ""}
      ${inquiry.services?.length ? `<p><strong>Leistungen:</strong> ${inquiry.services.map(escapeHtml).join(", ")}</p>` : ""}
      ${productRows ? `<p><strong>Produkte:</strong></p><ul>${productRows}</ul>` : ""}
      <p><strong>Nachricht:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
    `,
  });
  return true;
}
