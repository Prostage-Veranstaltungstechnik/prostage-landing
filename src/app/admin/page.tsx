"use client";

import { useState, useEffect, FormEvent } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  price: string;
  unit: string;
  specs?: Record<string, string>;
  availability?: string;
}

const categoryOptions = [
  { key: "ton", label: "Tontechnik" },
  { key: "licht", label: "Lichttechnik" },
  { key: "buehne", label: "Bühnentechnik" },
  { key: "video", label: "Video" },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "ton", description: "" });
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (password === "prostage2026") {
      setAuthenticated(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authenticated) loadProducts();
  }, [authenticated]);

  async function handleAddProduct(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!newProduct.name.trim() || !newProduct.description.trim()) {
      setFormError("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        setNewProduct({ name: "", category: "ton", description: "" });
        setShowForm(false);
        loadProducts();
      } else {
        const data = await res.json();
        setFormError(data.error || "Fehler beim Erstellen.");
      }
    } catch {
      setFormError("Netzwerkfehler.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Produkt wirklich löschen?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadProducts();
      }
    } catch {
      // silent
    }
    setDeleting(null);
  }

  // Login screen
  if (!authenticated) {
    return (
      <section className="pt-32 pb-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-sm mx-auto px-6">
          <h1 className="font-heading text-3xl font-extrabold text-gray-900 mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Zugang zum ProStage Verwaltungsbereich
          </p>

          <form onSubmit={handleLogin} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
              placeholder="Passwort eingeben"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all mb-4 ${
                pwError
                  ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 bg-gray-50 focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
              }`}
            />
            {pwError && (
              <p className="text-xs text-red-500 mb-3">Falsches Passwort.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
            >
              Anmelden
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Admin dashboard
  return (
    <section className="pt-32 pb-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-gray-900">
              Produkt<span className="text-brand">verwaltung</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} Produkte im Inventar
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
          >
            {showForm ? (
              "Abbrechen"
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="3" x2="8" y2="13" />
                  <line x1="3" y1="8" x2="13" y2="8" />
                </svg>
                Neues Produkt
              </>
            )}
          </button>
        </div>

        {/* Add product form */}
        {showForm && (
          <form onSubmit={handleAddProduct} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">Neues Produkt anlegen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Produktname"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Kategorie *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Beschreibung *
              </label>
              <textarea
                rows={3}
                placeholder="Produktbeschreibung..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all resize-vertical"
              />
            </div>
            {formError && <p className="text-xs text-red-500 mb-3">{formError}</p>}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
            >
              Produkt anlegen
            </button>
          </form>
        )}

        {/* Products table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Lade Produkte…</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Kategorie</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Preis</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand/5 px-2 py-1 rounded-md">
                          {product.categoryLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-gray-600">
                        {product.price} {product.unit}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          {deleting === product.id ? "…" : "Löschen"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                        Keine Produkte vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
