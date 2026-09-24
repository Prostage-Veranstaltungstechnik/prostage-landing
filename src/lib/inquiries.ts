import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, ensureSchema } from "@/lib/db";
import type { Inquiry, InquiryKind, InquiryStatus } from "@/types/inquiry";

type NewInquiry = {
  kind: InquiryKind;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  rentalFrom?: string;
  rentalTo?: string;
  services?: string[];
  products?: Array<Record<string, string>>;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function mapInquiry(row: RowDataPacket): Inquiry {
  return {
    id: Number(row.id),
    kind: row.kind,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    rentalFrom: row.rental_from ? String(row.rental_from).slice(0, 10) : null,
    rentalTo: row.rental_to ? String(row.rental_to).slice(0, 10) : null,
    services: parseJson(row.services, []),
    products: parseJson(row.products, []),
    status: row.status,
    mailSent: Boolean(row.mail_sent),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function createInquiry(input: NewInquiry) {
  await ensureSchema();
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO inquiries
      (kind, name, email, phone, subject, message, rental_from, rental_to, services, products)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.kind,
      input.name,
      input.email,
      input.phone || null,
      input.subject || null,
      input.message,
      input.rentalFrom || null,
      input.rentalTo || null,
      JSON.stringify(input.services || []),
      JSON.stringify(input.products || []),
    ]
  );
  return result.insertId;
}

export async function markInquiryMailSent(id: number) {
  await db.execute("UPDATE inquiries SET mail_sent = TRUE WHERE id = ?", [id]);
}

export async function readInquiries() {
  await ensureSchema();
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500"
  );
  return rows.map(mapInquiry);
}

export async function updateInquiryStatus(id: number, status: InquiryStatus) {
  await ensureSchema();
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE inquiries SET status = ? WHERE id = ?",
    [status, id]
  );
  return result.affectedRows > 0;
}
