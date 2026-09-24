import mysql, { type Pool } from "mysql2/promise";
import seedProducts from "@/data/products.json";
import type { Product } from "@/types/product";

declare global {
  // eslint-disable-next-line no-var
  var prostagePool: Pool | undefined;
}

function createDatabasePool() {
  if (process.env.DATABASE_URL) {
    return mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 10,
      enableKeepAlive: true,
      dateStrings: true,
      ssl: process.env.MYSQL_SSL === "true" ? {} : undefined,
    });
  }

  return mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "prostage",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "prostage",
    connectionLimit: 10,
    enableKeepAlive: true,
    dateStrings: true,
    ssl: process.env.MYSQL_SSL === "true" ? {} : undefined,
  });
}

export const db = global.prostagePool || createDatabasePool();

if (process.env.NODE_ENV !== "production") {
  global.prostagePool = db;
}

let schemaPromise: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = initializeSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

async function initializeSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(191) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(80) NOT NULL,
      category_label VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      price VARCHAR(80) NOT NULL,
      unit VARCHAR(40) NOT NULL,
      specs JSON NOT NULL,
      availability VARCHAR(80) NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      image TEXT NULL,
      is_set BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_sort (sort_order),
      INDEX idx_products_category (category)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  const [productColumns] = await db.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_set'`
  );
  if (productColumns.length === 0) {
    await db.execute("ALTER TABLE products ADD COLUMN is_set BOOLEAN NOT NULL DEFAULT FALSE AFTER image");
  }

  const [visibilityColumns] = await db.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'visible'`
  );
  if (visibilityColumns.length === 0) {
    await db.execute("ALTER TABLE products ADD COLUMN visible BOOLEAN NOT NULL DEFAULT TRUE AFTER featured");
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_set_items (
      set_id VARCHAR(191) NOT NULL,
      product_id VARCHAR(191) NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      PRIMARY KEY (set_id, product_id),
      CONSTRAINT fk_set_item_set FOREIGN KEY (set_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_set_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      kind ENUM('rental', 'contact') NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone VARCHAR(80) NULL,
      subject VARCHAR(255) NULL,
      message TEXT NOT NULL,
      rental_from DATE NULL,
      rental_to DATE NULL,
      services JSON NULL,
      products JSON NULL,
      status ENUM('new', 'in_progress', 'done') NOT NULL DEFAULT 'new',
      mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_inquiries_created (created_at),
      INDEX idx_inquiries_status (status),
      INDEX idx_inquiries_kind (kind)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reference_entries (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255) NOT NULL,
      event_date DATE NOT NULL,
      image TEXT NOT NULL,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_references_date (event_date),
      INDEX idx_references_visible (visible)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(120) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS spam_rate_limits (
      bucket VARCHAR(80) NOT NULL,
      client_key CHAR(64) NOT NULL,
      window_started BIGINT UNSIGNED NOT NULL,
      hits INT UNSIGNED NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (bucket, client_key),
      INDEX idx_spam_rate_updated (updated_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS spam_submission_fingerprints (
      fingerprint CHAR(64) PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL,
      INDEX idx_spam_fingerprint_expiry (expires_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      id VARCHAR(191) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  const inventoryMigration = "2026-09-eventworx-inventory-v3-network";
  const [migrationRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id FROM app_migrations WHERE id = ?",
    [inventoryMigration]
  );
  if (migrationRows.length === 0) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const demoProductIds = [
        "line-array", "subwoofer", "mischpult", "mikrofon-set", "moving-heads",
        "led-par", "followspot", "grandma3", "traversen", "buehnenpodest",
        "kettenzug", "led-wall", "beamer",
      ];
      await connection.query("DELETE FROM products WHERE id IN (?)", [demoProductIds]);

      for (const product of seedProducts as unknown as Product[]) {
        await connection.execute(
          `INSERT INTO products
            (id, name, category, category_label, description, price, unit, specs, availability, featured, visible, sort_order, image, is_set)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name), category = VALUES(category), category_label = VALUES(category_label),
             description = VALUES(description), price = VALUES(price), unit = VALUES(unit),
             specs = VALUES(specs), availability = VALUES(availability), featured = VALUES(featured),
             visible = VALUES(visible), sort_order = VALUES(sort_order), image = VALUES(image), is_set = VALUES(is_set)`,
          [
            product.id,
            product.name,
            product.category,
            product.categoryLabel,
            product.description,
            product.price,
            product.unit,
            JSON.stringify(product.specs || {}),
            product.availability,
            product.featured,
            product.visible ?? true,
            product.sortOrder,
            product.image,
            product.isSet ?? false,
          ]
        );
      }

      for (const product of seedProducts as unknown as Product[]) {
        await connection.execute("DELETE FROM product_set_items WHERE set_id = ?", [product.id]);
        if (!product.isSet) continue;
        for (const item of product.setItems || []) {
          await connection.execute(
            "INSERT INTO product_set_items (set_id, product_id, quantity) VALUES (?, ?, ?)",
            [product.id, item.productId, item.quantity]
          );
        }
      }

      await connection.execute("INSERT INTO app_migrations (id) VALUES (?)", [inventoryMigration]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  await db.execute(
    "UPDATE products SET category = 'buehne-kabel', category_label = 'Bühne & Kabel' WHERE category = 'vermietung'"
  );
  await db.execute(
    "UPDATE products SET category = 'licht', category_label = 'Lichttechnik' WHERE category = 'fullservice'"
  );
}
