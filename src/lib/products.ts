import path from "path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, ensureSchema } from "@/lib/db";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

const DATA_DIR =
  process.env.DATA_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/data"
    : path.join(process.cwd(), ".data"));
const IMAGES_DIR = path.join(DATA_DIR, "images");

function parseSpecs(value: unknown): Record<string, string> {
  if (value == null) return {};
  if (typeof value !== "string") return value as Record<string, string>;
  try { return JSON.parse(value); } catch { return {}; }
}

function mapProduct(row: RowDataPacket): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: row.category_label,
    description: row.description,
    price: row.price,
    unit: row.unit,
    specs: parseSpecs(row.specs),
    availability: row.availability,
    featured: Boolean(row.featured),
    visible: Boolean(row.visible),
    sortOrder: Number(row.sort_order),
    image: row.image,
    isSet: Boolean(row.is_set),
    setItems: [],
  };
}

export async function readProducts({ includeHidden = false }: { includeHidden?: boolean } = {}): Promise<Product[]> {
  await ensureSchema();
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM products
     ${includeHidden ? "" : "WHERE visible = TRUE"}
     ORDER BY sort_order ASC, name ASC`
  );
  const products = rows.map(mapProduct);
  const [setRows] = await db.query<RowDataPacket[]>(
    `SELECT items.set_id, items.product_id, items.quantity, products.name AS product_name
     FROM product_set_items items
     JOIN products ON products.id = items.product_id
     ${includeHidden ? "" : "WHERE products.visible = TRUE"}
     ORDER BY products.name ASC`
  );
  const byId = new Map(products.map((product) => [product.id, product]));
  for (const row of setRows) {
    byId.get(row.set_id)?.setItems.push({
      productId: row.product_id,
      quantity: Number(row.quantity),
      productName: row.product_name,
    });
  }
  return products;
}

export async function findProduct(id: string) {
  await ensureSchema();
  return (await readProducts({ includeHidden: true })).find((product) => product.id === id) || null;
}

async function replaceSetItems(setId: string, items: Product["setItems"]) {
  await db.execute("DELETE FROM product_set_items WHERE set_id = ?", [setId]);
  for (const item of items) {
    const quantity = Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1)));
    if (!item.productId || item.productId === setId) continue;
    await db.execute(
      "INSERT INTO product_set_items (set_id, product_id, quantity) VALUES (?, ?, ?)",
      [setId, item.productId, quantity]
    );
  }
}

export async function createProduct(input: Partial<Product> & Pick<Product, "name" | "category" | "description">) {
  await ensureSchema();
  let id = generateId(input.name);
  if (!id) id = `produkt-${Date.now()}`;
  if (await findProduct(id)) id = `${id}-${Date.now()}`;

  const [orderRows] = await db.query<RowDataPacket[]>(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextOrder FROM products"
  );
  const product: Product = {
    id,
    name: input.name.trim(),
    category: input.category,
    categoryLabel: CATEGORY_LABELS[input.category] || input.category,
    description: input.description.trim(),
    price: input.price || "Auf Anfrage",
    unit: input.unit || "/Tag",
    specs: input.specs || {},
    availability: input.availability || "Verfügbar",
    featured: input.featured ?? false,
    visible: input.visible ?? true,
    sortOrder: Number(orderRows[0]?.nextOrder || 0),
    image: input.image || null,
    isSet: input.isSet ?? false,
    setItems: input.isSet ? input.setItems || [] : [],
  };

  await db.execute(
    `INSERT INTO products
      (id, name, category, category_label, description, price, unit, specs, availability, featured, visible, sort_order, image, is_set)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.id, product.name, product.category, product.categoryLabel,
      product.description, product.price, product.unit, JSON.stringify(product.specs),
      product.availability, product.featured, product.visible, product.sortOrder, product.image, product.isSet,
    ]
  );
  await replaceSetItems(product.id, product.setItems);
  return product;
}

export async function updateProduct(id: string, input: Partial<Product>) {
  const existing = await findProduct(id);
  if (!existing) return null;
  const category = input.category ?? existing.category;
  const product: Product = {
    ...existing,
    ...input,
    id,
    category,
    categoryLabel: CATEGORY_LABELS[category] || category,
    specs: input.specs ?? existing.specs,
    image: input.image !== undefined ? input.image : existing.image,
    isSet: input.isSet ?? existing.isSet,
    setItems: input.isSet === false
      ? []
      : input.setItems ?? existing.setItems,
  };

  await db.execute(
    `UPDATE products SET
      name = ?, category = ?, category_label = ?, description = ?, price = ?,
      unit = ?, specs = ?, availability = ?, featured = ?, visible = ?, sort_order = ?, image = ?, is_set = ?
     WHERE id = ?`,
    [
      product.name, product.category, product.categoryLabel, product.description,
      product.price, product.unit, JSON.stringify(product.specs), product.availability,
      product.featured, product.visible, product.sortOrder, product.image, product.isSet, id,
    ]
  );
  await replaceSetItems(id, product.setItems);
  return product;
}

export async function deleteProduct(id: string) {
  await ensureSchema();
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM products WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

export function getImagesDir() {
  return IMAGES_DIR;
}

export function generateId(name: string) {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
