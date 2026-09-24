import type { RowDataPacket } from "mysql2";
import { db, ensureSchema } from "@/lib/db";

const MAINTENANCE_KEY = "maintenance_mode";

export async function getMaintenanceMode() {
  await ensureSchema();
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1",
    [MAINTENANCE_KEY]
  );
  return rows[0]?.setting_value === "true";
}

export async function setMaintenanceMode(enabled: boolean) {
  await ensureSchema();
  await db.execute(
    `INSERT INTO site_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [MAINTENANCE_KEY, enabled ? "true" : "false"]
  );
  return enabled;
}
