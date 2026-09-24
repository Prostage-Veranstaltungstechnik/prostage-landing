import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, ensureSchema } from "@/lib/db";
import type { ReferenceEntry, ReferenceInput } from "@/types/reference";

function mapReference(row: RowDataPacket): ReferenceEntry {
  return {
    id: Number(row.id),
    title: row.title,
    type: row.type,
    description: row.description,
    location: row.location,
    eventDate: String(row.event_date).slice(0, 10),
    image: row.image,
    visible: Boolean(row.visible),
    sortOrder: Number(row.sort_order),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function readReferences({ includeHidden = false }: { includeHidden?: boolean } = {}) {
  await ensureSchema();
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM reference_entries
     ${includeHidden ? "" : "WHERE visible = TRUE"}
     ORDER BY event_date DESC, sort_order ASC, id DESC`
  );
  return rows.map(mapReference);
}

export async function findReference(id: number) {
  const references = await readReferences({ includeHidden: true });
  return references.find((entry) => entry.id === id) || null;
}

export async function createReference(input: ReferenceInput) {
  await ensureSchema();
  const [orderRows] = await db.query<RowDataPacket[]>(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM reference_entries"
  );
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO reference_entries
      (title, type, description, location, event_date, image, visible, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title.trim(), input.type.trim(), input.description.trim(), input.location.trim(),
      input.eventDate, input.image, input.visible, Number(orderRows[0]?.next_order || 0),
    ]
  );
  return findReference(result.insertId);
}

export async function updateReference(id: number, input: Partial<ReferenceInput>) {
  const existing = await findReference(id);
  if (!existing) return null;
  const next = { ...existing, ...input };
  await db.execute(
    `UPDATE reference_entries SET
      title = ?, type = ?, description = ?, location = ?, event_date = ?,
      image = ?, visible = ?, sort_order = ?
     WHERE id = ?`,
    [
      next.title.trim(), next.type.trim(), next.description.trim(), next.location.trim(),
      next.eventDate, next.image, next.visible, next.sortOrder, id,
    ]
  );
  return findReference(id);
}

export async function deleteReference(id: number) {
  await ensureSchema();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM reference_entries WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}
