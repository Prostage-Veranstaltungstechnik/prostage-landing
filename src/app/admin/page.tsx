"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent, type ChangeEvent } from "react";
import type { Product } from "@/types/product";
import {
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
  AVAILABILITY_OPTIONS,
} from "@/types/product";

// ─── Helpers ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        accent
          ? "bg-brand/5 border-brand/20"
          : "bg-white border-gray-200"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </p>
      <p
        className={`font-heading text-2xl font-bold ${
          accent ? "text-brand" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Delete confirmation modal ──────────────────────────────────────

function DeleteModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
          Produkt löschen?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700">{product.name}</span>{" "}
          wird unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig
          gemacht werden.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spec row editor ────────────────────────────────────────────────

function SpecsEditor({
  specs,
  onChange,
}: {
  specs: Record<string, string>;
  onChange: (s: Record<string, string>) => void;
}) {
  const entries = Object.entries(specs);

  function updateKey(oldKey: string, newKey: string) {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(specs)) {
      result[k === oldKey ? newKey : k] = v;
    }
    onChange(result);
  }

  function updateValue(key: string, value: string) {
    onChange({ ...specs, [key]: value });
  }

  function removeSpec(key: string) {
    const copy = { ...specs };
    delete copy[key];
    onChange(copy);
  }

  function addSpec() {
    let newKey = "Neu";
    let i = 1;
    while (specs[newKey] !== undefined) {
      newKey = `Neu ${i++}`;
    }
    onChange({ ...specs, [newKey]: "" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Technische Daten
        </label>
        <button
          type="button"
          onClick={addSpec}
          className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
        >
          + Zeile hinzufügen
        </button>
      </div>
      {entries.length === 0 && (
        <p className="text-xs text-gray-400 italic">Keine Specs vorhanden.</p>
      )}
      <div className="space-y-2">
        {entries.map(([key, value], i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={key}
              onChange={(e) => updateKey(key, e.target.value)}
              placeholder="Eigenschaft"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/10"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(key, e.target.value)}
              placeholder="Wert"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/10"
            />
            <button
              type="button"
              onClick={() => removeSpec(key)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Entfernen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product form (add / edit) ──────────────────────────────────────

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  unit: string;
  availability: string;
  featured: boolean;
  specs: Record<string, string>;
  image: string | null;
}

const emptyForm: ProductFormData = {
  name: "",
  category: "ton",
  description: "",
  price: "",
  unit: "/Tag",
  availability: "Verfügbar",
  featured: false,
  specs: {},
  image: null,
};

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
  productId,
}: {
  initial: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  submitLabel: string;
  productId?: string;
}) {
  const [form, setForm] = useState<ProductFormData>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initial.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(patch: Partial<ProductFormData>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = productId || form.name
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue").replace(/[ß]/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!id) {
      setError("Bitte zuerst einen Namen eingeben.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("productId", id);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload fehlgeschlagen.");
      }
      const { url } = await res.json();
      update({ image: url });
      setImagePreview(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    }
    setUploading(false);
  }

  function removeImage() {
    update({ image: null });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.description.trim()) {
      setError("Name und Beschreibung sind erforderlich.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row: Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Produktname"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Kategorie *
              </label>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Beschreibung *
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Produktbeschreibung..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all resize-vertical"
            />
          </div>

          {/* Row: Price + Unit + Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Preis
              </label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => update({ price: e.target.value })}
                placeholder="z.B. ab 120€"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Einheit
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => update({ unit: e.target.value })}
                placeholder="/Tag"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Verfügbarkeit
              </label>
              <select
                value={form.availability}
                onChange={(e) => update({ availability: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update({ featured: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-brand transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Als Featured markieren
            </span>
          </label>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Produktbild
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Produktbild"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
                  title="Bild entfernen"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs text-gray-400">Upload</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploading && (
              <p className="text-xs text-brand mt-2">Bild wird hochgeladen...</p>
            )}
          </div>

          {/* Specs */}
          <SpecsEditor
            specs={form.specs}
            onChange={(specs) => update({ specs })}
          />

          {/* Error */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20 disabled:opacity-60"
            >
              {saving ? "Speichern…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main admin page ────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [filterCategory, setFilterCategory] = useState("all");
  const [sortField, setSortField] = useState<"sortOrder" | "name" | "category" | "price">("sortOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) setProducts(await res.json());
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) loadProducts();
  }, [authenticated, loadProducts]);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (password === "prostage2026") {
      setAuthenticated(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  // ── CRUD helpers ──────────────────

  async function handleAdd(data: ProductFormData) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Erstellen.");
    }
    setShowAddForm(false);
    await loadProducts();
  }

  async function handleEdit(data: ProductFormData) {
    if (!editingProduct) return;
    const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        categoryLabel: CATEGORY_LABELS[data.category] || data.category,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Aktualisieren.");
    }
    setEditingProduct(null);
    await loadProducts();
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    await fetch(`/api/admin/products/${deletingProduct.id}`, {
      method: "DELETE",
    });
    setDeletingProduct(null);
    await loadProducts();
  }

  async function toggleFeatured(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !product.featured }),
    });
    await loadProducts();
  }

  async function moveProduct(product: Product, direction: "up" | "down") {
    const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((p) => p.id === product.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/admin/products/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: product.sortOrder }),
      }),
    ]);
    await loadProducts();
  }

  // ── Sorting / filtering ───────────

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = products
    .filter((p) => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "sortOrder") return (a.sortOrder - b.sortOrder) * dir;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      if (sortField === "category") return a.category.localeCompare(b.category) * dir;
      if (sortField === "price") return a.price.localeCompare(b.price) * dir;
      return 0;
    });

  // ── Stats ─────────────────────────

  const stats = {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    byCategory: CATEGORY_OPTIONS.reduce(
      (acc, c) => {
        acc[c.label] = products.filter((p) => p.category === c.key).length;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  // ── Sort indicator ────────────────

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <span className="text-gray-300 ml-1">&#8597;</span>;
    return (
      <span className="text-brand ml-1">
        {sortDir === "asc" ? "&#8593;" : "&#8595;"}
      </span>
    );
  }

  // ── Login screen ──────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-1">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm">
              ProStage Produktverwaltung
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPwError(false);
              }}
              placeholder="Passwort eingeben"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-white bg-gray-800 focus:outline-none transition-all mb-4 ${
                pwError
                  ? "border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              }`}
            />
            {pwError && (
              <p className="text-xs text-red-400 mb-3">Falsches Passwort.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ───────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-950 text-white shrink-0">
        <div className="px-6 py-6 border-b border-gray-800">
          <h1 className="font-heading text-lg font-bold">
            Pro<span className="text-brand">Stage</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-4">
          <div className="px-3 py-2.5 rounded-xl bg-brand/10 text-brand text-sm font-semibold flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Produkte
          </div>
        </nav>
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={() => setAuthenticated(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-900">
              Produkt<span className="text-brand">verwaltung</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              {products.length} Produkte verwalten
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuthenticated(false)}
              className="lg:hidden text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Abmelden
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="3" x2="8" y2="13" />
                <line x1="3" y1="8" x2="13" y2="8" />
              </svg>
              <span className="hidden sm:inline">Neues Produkt</span>
            </button>
          </div>
        </header>

        <div className="px-6 lg:px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Gesamt" value={stats.total} accent />
            <StatCard label="Featured" value={stats.featured} />
            {CATEGORY_OPTIONS.map((c) => (
              <StatCard
                key={c.key}
                label={c.label}
                value={stats.byCategory[c.label] || 0}
              />
            ))}
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                filterCategory === "all"
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              Alle ({products.length})
            </button>
            {CATEGORY_OPTIONS.map((c) => {
              const count = products.filter(
                (p) => p.category === c.key
              ).length;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilterCategory(c.key)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    filterCategory === c.key
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Product table */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              Lade Produkte…
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      <th className="w-20 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">
                        Pos.
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 cursor-pointer select-none hover:text-gray-600"
                        onClick={() => handleSort("name")}
                      >
                        Name <SortIcon field="name" />
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 cursor-pointer select-none hover:text-gray-600 hidden md:table-cell"
                        onClick={() => handleSort("category")}
                      >
                        Kategorie <SortIcon field="category" />
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 cursor-pointer select-none hover:text-gray-600 hidden sm:table-cell"
                        onClick={() => handleSort("price")}
                      >
                        Preis <SortIcon field="price" />
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                        Status
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                        Featured
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Reorder */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => moveProduct(product, "up")}
                              className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                              title="Nach oben"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="4,10 8,6 12,10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveProduct(product, "down")}
                              className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                              title="Nach unten"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="4,6 8,10 12,6" />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Name + description */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-left group/name"
                          >
                            <div className="font-medium text-gray-900 group-hover/name:text-brand transition-colors">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[300px]">
                              {product.description}
                            </div>
                          </button>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand/5 px-2 py-1 rounded-md">
                            {product.categoryLabel}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                          {product.price}{" "}
                          <span className="text-gray-400">
                            {product.unit}
                          </span>
                        </td>

                        {/* Availability status */}
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              product.availability === "Verfügbar"
                                ? "bg-emerald-50 text-emerald-600"
                                : product.availability === "Auf Anfrage"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-500"
                            }`}
                          >
                            {product.availability}
                          </span>
                        </td>

                        {/* Featured toggle */}
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <button
                            onClick={() => toggleFeatured(product)}
                            className="mx-auto"
                            title={
                              product.featured
                                ? "Featured entfernen"
                                : "Als Featured markieren"
                            }
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill={product.featured ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`transition-colors ${
                                product.featured
                                  ? "text-amber-400"
                                  : "text-gray-300 hover:text-amber-300"
                              }`}
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                              title="Bearbeiten"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Löschen"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          Keine Produkte gefunden.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ─────────────────── */}

      {showAddForm && (
        <ProductForm
          initial={emptyForm}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          title="Neues Produkt anlegen"
          submitLabel="Produkt anlegen"
        />
      )}

      {editingProduct && (
        <ProductForm
          initial={{
            name: editingProduct.name,
            category: editingProduct.category,
            description: editingProduct.description,
            price: editingProduct.price,
            unit: editingProduct.unit,
            availability: editingProduct.availability,
            featured: editingProduct.featured,
            specs: editingProduct.specs,
            image: editingProduct.image,
          }}
          onSubmit={handleEdit}
          onCancel={() => setEditingProduct(null)}
          title="Produkt bearbeiten"
          submitLabel="Speichern"
          productId={editingProduct.id}
        />
      )}

      {deletingProduct && (
        <DeleteModal
          product={deletingProduct}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  );
}
