"use client";

import { useState, useEffect, useCallback, useRef, type FormEvent, type ChangeEvent } from "react";
import type { Product } from "@/types/product";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import type { ReferenceEntry, ReferenceInput } from "@/types/reference";
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
  visible: boolean;
  specs: Record<string, string>;
  image: string | null;
  isSet: boolean;
  setItems: Product["setItems"];
}

const emptyForm: ProductFormData = {
  name: "",
  category: "ton",
  description: "",
  price: "",
  unit: "/Tag",
  availability: "Verfügbar",
  featured: false,
  visible: true,
  specs: {},
  image: null,
  isSet: false,
  setItems: [],
};

function ProductForm({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
  productId,
  availableProducts,
}: {
  initial: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  submitLabel: string;
  productId?: string;
  availableProducts: Product[];
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
    if (form.isSet && form.setItems.length === 0) {
      setError("Bitte mindestens ein Produkt zum Set hinzufügen.");
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
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => update({ isSet: false, setItems: [] })}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                !form.isSet ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Einzelprodukt
            </button>
            <button
              type="button"
              onClick={() => update({ isSet: true })}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                form.isSet ? "bg-white text-brand shadow-sm" : "text-gray-500"
              }`}
            >
              Produkt-Set
            </button>
          </div>

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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => update({ visible: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-emerald-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Öffentlich sichtbar</span>
            </label>
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
              <span className="text-sm font-medium text-gray-700">Als Featured markieren</span>
            </label>
          </div>

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

          {form.isSet && (
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Set zusammenstellen</p>
                <p className="mt-1 text-xs text-gray-500">Wähle Einzelprodukte und die enthaltene Menge.</p>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableProducts
                  .filter((product) => !product.isSet && product.id !== productId)
                  .map((product) => {
                    const selected = form.setItems.find((item) => item.productId === product.id);
                    return (
                      <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={Boolean(selected)}
                          onChange={(event) => update({
                            setItems: event.target.checked
                              ? [...form.setItems, { productId: product.id, quantity: 1, productName: product.name }]
                              : form.setItems.filter((item) => item.productId !== product.id),
                          })}
                          className="h-4 w-4 accent-brand"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">{product.name}</span>
                        {selected && (
                          <label className="flex items-center gap-2 text-xs text-gray-500">
                            Menge
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={selected.quantity}
                              onChange={(event) => update({
                                setItems: form.setItems.map((item) =>
                                  item.productId === product.id
                                    ? { ...item, quantity: Math.max(1, Number(event.target.value) || 1) }
                                    : item
                                ),
                              })}
                              className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                {availableProducts.filter((product) => !product.isSet && product.id !== productId).length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">Lege zuerst Einzelprodukte an.</p>
                )}
              </div>
            </div>
          )}

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

type ReferenceFormData = Omit<ReferenceInput, "sortOrder">;

const emptyReferenceForm: ReferenceFormData = {
  title: "",
  type: "",
  description: "",
  location: "",
  eventDate: "",
  image: "",
  visible: true,
};

function ReferenceForm({
  initial,
  onSubmit,
  onCancel,
  title,
  submitLabel,
  referenceId,
}: {
  initial: ReferenceFormData;
  onSubmit: (data: ReferenceFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  submitLabel: string;
  referenceId?: number;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(patch: Partial<ReferenceFormData>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!form.title.trim() && !referenceId) {
      setError("Bitte zuerst einen Titel eingeben.");
      event.target.value = "";
      return;
    }

    const identifier = referenceId
      ? `reference-${referenceId}`
      : `reference-${form.title.toLowerCase().replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("assetId", identifier);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload fehlgeschlagen.");
      update({ image: result.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload fehlgeschlagen.");
    }
    setUploading(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.type.trim() || !form.description.trim() || !form.location.trim() || !form.eventDate || !form.image) {
      setError("Titel, Art, Ort, Datum, Beschreibung und Bild sind erforderlich.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Fehler beim Speichern.");
    }
    setSaving(false);
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200" aria-label="Schließen">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Titel *</span><input className={inputClass} value={form.title} onChange={(event) => update({ title: event.target.value })} maxLength={255} required /></label>
            <label><span className={labelClass}>Art der Veranstaltung *</span><input className={inputClass} value={form.type} onChange={(event) => update({ type: event.target.value })} placeholder="z. B. Konzert, Messe, Corporate" maxLength={120} required /></label>
            <label><span className={labelClass}>Ort *</span><input className={inputClass} value={form.location} onChange={(event) => update({ location: event.target.value })} placeholder="z. B. Frankfurt am Main" maxLength={255} required /></label>
            <label><span className={labelClass}>Datum *</span><input type="date" className={inputClass} value={form.eventDate} onChange={(event) => update({ eventDate: event.target.value })} required /></label>
          </div>
          <label className="block"><span className={labelClass}>Beschreibung *</span><textarea className={`${inputClass} min-h-28 resize-y`} value={form.description} onChange={(event) => update({ description: event.target.value })} maxLength={5000} required /></label>
          <div>
            <span className={labelClass}>Bild *</span>
            {form.image ? (
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                <img src={form.image} alt="Vorschau" className="h-56 w-full object-cover" />
                <button type="button" onClick={() => { update({ image: "" }); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute right-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-500 shadow">Bild entfernen</button>
              </div>
            ) : (
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center hover:border-brand/30 hover:bg-brand/[0.02]">
                <span className="text-sm font-semibold text-gray-700">Bild auswählen</span>
                <span className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP oder GIF · max. 10 MB</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="sr-only" />
              </label>
            )}
            {uploading && <p className="mt-2 text-xs text-brand">Bild wird hochgeladen …</p>}
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"><input type="checkbox" checked={form.visible} onChange={(event) => update({ visible: event.target.checked })} className="h-4 w-4 accent-brand" />Auf der Website anzeigen</label>
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-500">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Abbrechen</button>
            <button type="submit" disabled={saving || uploading} className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand-dark disabled:opacity-60">{saving ? "Speichern …" : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReferenceDeleteModal({ reference, onConfirm, onCancel }: { reference: ReferenceEntry; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="font-heading text-lg font-bold text-gray-900">Referenz löschen?</h3>
        <p className="mb-6 mt-2 text-sm text-gray-500"><span className="font-semibold text-gray-700">{reference.title}</span> und das zugehörige Bild werden unwiderruflich gelöscht.</p>
        <div className="flex gap-3"><button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600">Abbrechen</button><button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Löschen</button></div>
      </div>
    </div>
  );
}

const INQUIRY_COLUMNS: Array<{
  status: InquiryStatus;
  label: string;
  columnClass: string;
  badgeClass: string;
  dotClass: string;
}> = [
  { status: "new", label: "Neu", columnClass: "border-blue-200 bg-blue-50/60", badgeClass: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500" },
  { status: "in_progress", label: "In Bearbeitung", columnClass: "border-amber-200 bg-amber-50/60", badgeClass: "bg-amber-100 text-amber-700", dotClass: "bg-amber-500" },
  { status: "done", label: "Erledigt", columnClass: "border-emerald-200 bg-emerald-50/60", badgeClass: "bg-emerald-100 text-emerald-700", dotClass: "bg-emerald-500" },
];

function inquiryStatus(status: InquiryStatus) {
  return INQUIRY_COLUMNS.find((column) => column.status === status) || INQUIRY_COLUMNS[0];
}

function InquiryDetailModal({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (status: InquiryStatus) => Promise<void>;
}) {
  const status = inquiryStatus(inquiry.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
      <article className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.badgeClass}`}>{status.label}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${inquiry.kind === "rental" ? "bg-brand/10 text-brand" : "bg-violet-100 text-violet-700"}`}>{inquiry.kind === "rental" ? "Mietanfrage" : "Kontaktanfrage"}</span>
            </div>
            <h2 className="mt-3 font-heading text-2xl font-bold text-gray-900">{inquiry.subject || inquiry.name}</h2>
            <p className="mt-1 text-xs text-gray-400">Eingegangen am {new Date(inquiry.createdAt).toLocaleString("de-DE")}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 hover:bg-gray-200" aria-label="Schließen">×</button>
        </header>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {INQUIRY_COLUMNS.map((column) => (
                <button key={column.status} type="button" onClick={() => onStatusChange(column.status)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${inquiry.status === column.status ? `${column.columnClass} ${column.badgeClass.split(" ")[1]}` : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
                  <span className={`h-2 w-2 rounded-full ${column.dotClass}`} />{column.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Name</p><p className="mt-1 text-sm font-semibold text-gray-900">{inquiry.name}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">E-Mail</p><a href={`mailto:${inquiry.email}`} className="mt-1 block break-all text-sm font-semibold text-brand hover:underline">{inquiry.email}</a></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Telefon</p>{inquiry.phone ? <a href={`tel:${inquiry.phone}`} className="mt-1 block text-sm font-semibold text-brand hover:underline">{inquiry.phone}</a> : <p className="mt-1 text-sm text-gray-400">Nicht angegeben</p>}</div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">E-Mail-Status</p><p className={`mt-1 text-sm font-semibold ${inquiry.mailSent ? "text-emerald-600" : "text-amber-600"}`}>{inquiry.mailSent ? "E-Mail versendet" : "Nur im System gespeichert"}</p></div>
          </section>

          {(inquiry.rentalFrom || inquiry.rentalTo) && (
            <section><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Mietzeitraum</h3><p className="mt-2 text-sm font-semibold text-gray-800">{inquiry.rentalFrom ? new Date(`${inquiry.rentalFrom}T12:00:00`).toLocaleDateString("de-DE") : "Offen"} bis {inquiry.rentalTo ? new Date(`${inquiry.rentalTo}T12:00:00`).toLocaleDateString("de-DE") : "Offen"}</p></section>
          )}

          {inquiry.services.length > 0 && (
            <section><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Leistungen</h3><div className="mt-2 flex flex-wrap gap-2">{inquiry.services.map((service) => <span key={service} className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">{service}</span>)}</div></section>
          )}

          {inquiry.products.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Angefragte Produkte</h3>
              <div className="mt-2 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
                {inquiry.products.map((product, index) => (
                  <div key={`${inquiry.id}-${index}`} className="flex items-center justify-between gap-4 bg-white px-4 py-3 text-sm">
                    <span className="font-semibold text-gray-800">{product.name || product.productName || `Produkt ${index + 1}`}</span>
                    {product.quantity && <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">Menge: {product.quantity}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Nachricht</h3><p className="mt-2 whitespace-pre-wrap rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">{inquiry.message}</p></section>
        </div>
      </article>
    </div>
  );
}

// ─── Main admin page ────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [references, setReferences] = useState<ReferenceEntry[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean | null>(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showReferenceForm, setShowReferenceForm] = useState(false);
  const [editingReference, setEditingReference] = useState<ReferenceEntry | null>(null);
  const [deletingReference, setDeletingReference] = useState<ReferenceEntry | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

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

  const loadInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) setInquiries(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const loadReferences = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/references");
      if (res.ok) setReferences(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const loadMaintenanceStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings/maintenance");
      const result = await response.json();
      if (response.ok) setMaintenanceEnabled(Boolean(result.enabled));
    } catch {
      setMaintenanceError("Website-Status konnte nicht geladen werden.");
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadProducts();
      loadReferences();
      loadInquiries();
      loadMaintenanceStatus();
    }
  }, [authenticated, loadProducts, loadReferences, loadInquiries, loadMaintenanceStatus]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setPwError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Anmeldung fehlgeschlagen.");
      setAuthenticated(true);
      setPassword("");
    } catch (error) {
      setPwError(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.");
    }
    setLoggingIn(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setAuthenticated(false);
    setProducts([]);
    setReferences([]);
    setInquiries([]);
    setMaintenanceEnabled(null);
  }

  async function changeInquiryStatus(id: number, status: InquiryStatus) {
    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setSelectedInquiry((current) => current?.id === id ? { ...current, status } : current);
      await loadInquiries();
    }
  }

  async function toggleMaintenanceMode() {
    if (maintenanceEnabled === null || savingMaintenance) return;
    setSavingMaintenance(true);
    setMaintenanceError("");
    try {
      const response = await fetch("/api/admin/settings/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !maintenanceEnabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Website-Status konnte nicht gespeichert werden.");
      setMaintenanceEnabled(Boolean(result.enabled));
    } catch (error) {
      setMaintenanceError(error instanceof Error ? error.message : "Website-Status konnte nicht gespeichert werden.");
    }
    setSavingMaintenance(false);
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

  async function toggleVisible(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !product.visible }),
    });
    await loadProducts();
  }

  async function handleAddReference(data: ReferenceFormData) {
    const response = await fetch("/api/admin/references", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Referenz konnte nicht erstellt werden.");
    setShowReferenceForm(false);
    await loadReferences();
  }

  async function handleEditReference(data: ReferenceFormData) {
    if (!editingReference) return;
    const response = await fetch(`/api/admin/references/${editingReference.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Referenz konnte nicht gespeichert werden.");
    setEditingReference(null);
    await loadReferences();
  }

  async function handleDeleteReference() {
    if (!deletingReference) return;
    const response = await fetch(`/api/admin/references/${deletingReference.id}`, { method: "DELETE" });
    if (!response.ok) return;
    setDeletingReference(null);
    await loadReferences();
  }

  async function toggleReferenceVisible(reference: ReferenceEntry) {
    await fetch(`/api/admin/references/${reference.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !reference.visible }),
    });
    await loadReferences();
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
    hidden: products.filter((p) => !p.visible).length,
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

  if (authenticated === null) {
    return <div className="min-h-screen bg-gray-950 grid place-items-center text-sm text-gray-400">Adminbereich wird geladen …</div>;
  }

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
                setPwError("");
              }}
              placeholder="Passwort eingeben"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-white bg-gray-800 focus:outline-none transition-all mb-4 ${
                Boolean(pwError)
                  ? "border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-700 focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              }`}
            />
            {pwError && (
              <p className="text-xs text-red-400 mb-3">{pwError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all disabled:opacity-60"
            >
              {loggingIn ? "Wird angemeldet …" : "Anmelden"}
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
        <div className="px-6 py-4 border-b border-gray-800">
          <h1 className="font-heading text-lg font-bold">
            Pro<span className="text-brand">Stage</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-4">
          <a href="#produkte" className="px-3 py-2.5 rounded-xl bg-brand/10 text-brand text-sm font-semibold flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Produkte
          </a>
          <a href="#referenzen" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            Referenzen
          </a>
          <a href="#anfragen" className="mt-2 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white text-sm font-semibold flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            Anfragen
            {inquiries.filter((item) => item.status === "new").length > 0 && (
              <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">
                {inquiries.filter((item) => item.status === "new").length}
              </span>
            )}
          </a>
        </nav>
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
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
              {products.length} Produkte · {references.length} Referenzen
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
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

        <div id="produkte" className="px-6 lg:px-8 py-6 space-y-6 scroll-mt-24">
          <section className={`rounded-2xl border p-5 shadow-sm ${maintenanceEnabled ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${maintenanceEnabled ? "bg-amber-500" : "bg-emerald-500"}`} />
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${maintenanceEnabled ? "text-amber-700" : "text-emerald-700"}`}>Website-Status</p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-gray-900">
                    {maintenanceEnabled === null ? "Status wird geladen …" : maintenanceEnabled ? "Website ist offline" : "Website ist online"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {maintenanceEnabled ? "Besucher sehen aktuell nur die Wartungsseite. Das Backoffice bleibt erreichbar." : "Alle öffentlichen Seiten sind für Besucher erreichbar."}
                  </p>
                  {maintenanceError && <p className="mt-2 text-xs font-semibold text-red-600">{maintenanceError}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMaintenanceMode}
                disabled={maintenanceEnabled === null || savingMaintenance}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 ${maintenanceEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                {savingMaintenance ? "Wird gespeichert …" : maintenanceEnabled ? "Website online schalten" : "Website offline schalten"}
              </button>
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            <StatCard label="Gesamt" value={stats.total} accent />
            <StatCard label="Featured" value={stats.featured} />
            <StatCard label="Ausgeblendet" value={stats.hidden} />
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
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${!product.visible ? "bg-gray-50/70 opacity-65" : ""}`}
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
                              {product.isSet && (
                                <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">Set</span>
                              )}
                              {!product.visible && (
                                <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">Ausgeblendet</span>
                              )}
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
                              onClick={() => toggleVisible(product)}
                              className={`p-2 rounded-lg transition-all ${product.visible ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`}
                              title={product.visible ? "Produkt ausblenden" : "Produkt einblenden"}
                            >
                              {product.visible ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.1 3.2" /><path d="M6.6 6.6C3.2 8.3 1 12 1 12s4 8 11 8a10.5 10.5 0 0 0 5.4-1.5" /></svg>
                              )}
                            </button>
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

          <section id="referenzen" className="scroll-mt-24 pt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Projekte & Veranstaltungen</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-gray-900">Referenzen</h2>
                <p className="mt-1 text-sm text-gray-500">Einträge für die öffentliche Referenzseite verwalten.</p>
              </div>
              <button onClick={() => setShowReferenceForm(true)} className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 hover:bg-brand-dark">
                <span className="text-lg leading-none">+</span> Neue Referenz
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {references.map((reference) => (
                <article key={reference.id} className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${!reference.visible ? "opacity-65" : ""}`}>
                  <div className="relative h-44 bg-gray-100">
                    <img src={reference.image} alt="" className="h-full w-full object-cover" />
                    <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm ${reference.visible ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>{reference.visible ? "Sichtbar" : "Ausgeblendet"}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="font-semibold uppercase tracking-wider text-brand">{reference.type}</span><span>·</span><span>{reference.location}</span><span>·</span><time>{new Date(`${reference.eventDate}T12:00:00`).toLocaleDateString("de-DE")}</time></div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-gray-900">{reference.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">{reference.description}</p>
                    <div className="mt-4 flex items-center justify-end gap-1 border-t border-gray-100 pt-3">
                      <button onClick={() => toggleReferenceVisible(reference)} className={`rounded-lg p-2 ${reference.visible ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`} title={reference.visible ? "Referenz ausblenden" : "Referenz einblenden"}>{reference.visible ? "◉" : "○"}</button>
                      <button onClick={() => setEditingReference(reference)} className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-brand/5 hover:text-brand">Bearbeiten</button>
                      <button onClick={() => setDeletingReference(reference)} className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500">Löschen</button>
                    </div>
                  </div>
                </article>
              ))}
              {references.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                  <p className="text-sm text-gray-400">Noch keine Referenzen vorhanden.</p>
                  <button onClick={() => setShowReferenceForm(true)} className="mt-3 text-sm font-semibold text-brand hover:text-brand-dark">Erste Referenz anlegen</button>
                </div>
              )}
            </div>
          </section>

          <section id="anfragen" className="scroll-mt-24 pt-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Posteingang</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-gray-900">Anfragen</h2>
              </div>
              <p className="text-xs text-gray-400">{inquiries.length} gespeicherte Anfragen</p>
            </div>
            <div className="grid items-start gap-4 xl:grid-cols-3">
              {INQUIRY_COLUMNS.map((column) => {
                const columnInquiries = inquiries.filter((inquiry) => inquiry.status === column.status);
                return (
                  <div key={column.status} className={`rounded-2xl border p-3 ${column.columnClass}`}>
                    <div className="mb-3 flex items-center justify-between px-1 py-1">
                      <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${column.dotClass}`} /><h3 className="text-sm font-bold text-gray-800">{column.label}</h3></div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${column.badgeClass}`}>{columnInquiries.length}</span>
                    </div>
                    <div className="space-y-3">
                      {columnInquiries.map((inquiry) => (
                        <button key={inquiry.id} type="button" onClick={() => setSelectedInquiry(inquiry)} className="block w-full rounded-xl border border-white/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${inquiry.kind === "rental" ? "bg-brand/10 text-brand" : "bg-violet-100 text-violet-700"}`}>{inquiry.kind === "rental" ? "Miete" : "Kontakt"}</span>
                            <time className="text-[11px] text-gray-400">{new Date(inquiry.createdAt).toLocaleDateString("de-DE")}</time>
                          </div>
                          <h4 className="mt-3 line-clamp-2 font-heading text-base font-bold text-gray-900">{inquiry.subject || inquiry.name}</h4>
                          <p className="mt-1 truncate text-xs font-medium text-gray-500">{inquiry.name}</p>
                          <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">{inquiry.message}</p>
                          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                            <span className={`text-[10px] font-semibold ${inquiry.mailSent ? "text-emerald-600" : "text-amber-600"}`}>{inquiry.mailSent ? "E-Mail versendet" : "Nur gespeichert"}</span>
                            <span className="text-xs font-bold text-brand">Details →</span>
                          </div>
                        </button>
                      ))}
                      {columnInquiries.length === 0 && <div className="rounded-xl border border-dashed border-gray-300/80 bg-white/50 px-4 py-8 text-center text-xs text-gray-400">Keine Anfragen</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* ── Modals ─────────────────── */}

      {showAddForm && (
        <ProductForm
          initial={emptyForm}
          availableProducts={products}
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
            visible: editingProduct.visible,
            specs: editingProduct.specs,
            image: editingProduct.image,
            isSet: editingProduct.isSet,
            setItems: editingProduct.setItems,
          }}
          availableProducts={products}
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

      {showReferenceForm && (
        <ReferenceForm
          initial={emptyReferenceForm}
          onSubmit={handleAddReference}
          onCancel={() => setShowReferenceForm(false)}
          title="Neue Referenz anlegen"
          submitLabel="Referenz anlegen"
        />
      )}

      {editingReference && (
        <ReferenceForm
          initial={{
            title: editingReference.title,
            type: editingReference.type,
            description: editingReference.description,
            location: editingReference.location,
            eventDate: editingReference.eventDate,
            image: editingReference.image,
            visible: editingReference.visible,
          }}
          referenceId={editingReference.id}
          onSubmit={handleEditReference}
          onCancel={() => setEditingReference(null)}
          title="Referenz bearbeiten"
          submitLabel="Speichern"
        />
      )}

      {deletingReference && (
        <ReferenceDeleteModal
          reference={deletingReference}
          onConfirm={handleDeleteReference}
          onCancel={() => setDeletingReference(null)}
        />
      )}

      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={(status) => changeInquiryStatus(selectedInquiry.id, status)}
        />
      )}
    </div>
  );
}
