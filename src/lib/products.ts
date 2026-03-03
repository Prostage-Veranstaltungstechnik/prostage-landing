import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/types/product";

const DATA_DIR = process.env.DATA_PATH || "/data";
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const SEED_FILE = path.join(process.cwd(), "src/data/products.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch {
    // ignore if already exists
  }
}

async function ensureProductsFile() {
  await ensureDataDir();
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    // File doesn't exist — seed from src/data/products.json
    try {
      const seed = await fs.readFile(SEED_FILE, "utf-8");
      await fs.writeFile(PRODUCTS_FILE, seed);
    } catch {
      // No seed file either — start with empty array
      await fs.writeFile(PRODUCTS_FILE, "[]");
    }
  }
}

export async function readProducts(): Promise<Product[]> {
  await ensureProductsFile();
  const data = await fs.readFile(PRODUCTS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function writeProducts(products: Product[]) {
  await ensureProductsFile();
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + "\n");
}

export function getImagesDir() {
  return IMAGES_DIR;
}

export function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
