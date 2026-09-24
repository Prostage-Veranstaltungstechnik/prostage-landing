import { createHash } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, ensureSchema } from "@/lib/db";

const MIN_FORM_AGE_MS = 3_000;
const MAX_LINKS = 4;

type RateLimitResult = { allowed: boolean; retryAfter: number };

function hash(value: string) {
  return createHash("sha256")
    .update(`${process.env.ADMIN_SESSION_SECRET || "prostage"}:${value}`)
    .digest("hex");
}

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

export function isCrossSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
      || request.headers.get("host");
    return Boolean(requestHost && new URL(origin).host !== requestHost);
  } catch {
    return true;
  }
}

export function isBotSubmission(body: Record<string, unknown>) {
  if (String(body.website || "").trim()) return true;
  const startedAt = Number(body.startedAt);
  return !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FORM_AGE_MS;
}

export function hasSuspiciousContent(...values: string[]) {
  const links = values.join(" ").match(/(?:https?:\/\/|www\.)/gi)?.length || 0;
  return links > MAX_LINKS;
}

export async function checkRateLimit(
  request: Request,
  bucket: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
  identity?: string
): Promise<RateLimitResult> {
  await ensureSchema();
  const now = Date.now();
  const windowStarted = Math.floor(now / windowMs) * windowMs;
  const key = hash(`${bucket}:${identity || clientAddress(request)}`);
  await db.execute(
    "DELETE FROM spam_rate_limits WHERE updated_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY) LIMIT 1000"
  );
  await db.execute(
    `INSERT INTO spam_rate_limits (bucket, client_key, window_started, hits)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       hits = IF(window_started = VALUES(window_started), hits + 1, 1),
       window_started = VALUES(window_started),
       updated_at = CURRENT_TIMESTAMP`,
    [bucket, key, windowStarted]
  );
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT hits FROM spam_rate_limits WHERE bucket = ? AND client_key = ?",
    [bucket, key]
  );
  return {
    allowed: Number(rows[0]?.hits || 0) <= limit,
    retryAfter: Math.max(1, Math.ceil((windowStarted + windowMs - now) / 1000)),
  };
}

export async function claimSubmissionFingerprint(bucket: string, values: unknown[]) {
  await ensureSchema();
  const fingerprint = hash(`${bucket}:${JSON.stringify(values)}`);
  await db.execute("DELETE FROM spam_submission_fingerprints WHERE expires_at <= CURRENT_TIMESTAMP");
  try {
    await db.execute<ResultSetHeader>(
      `INSERT INTO spam_submission_fingerprints (fingerprint, expires_at)
       VALUES (?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE))`,
      [fingerprint]
    );
    return true;
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") return false;
    throw error;
  }
}
