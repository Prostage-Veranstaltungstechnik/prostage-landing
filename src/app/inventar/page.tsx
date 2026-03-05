"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { CATEGORY_OPTIONS } from "@/types/product";
import { useCart } from "@/hooks/useCart";

const categories = [
  { key: "all", label: "Alle" },
  ...CATEGORY_OPTIONS,
];

function ProductImage({ product, className }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image}
        alt={product.name}
        className={`w-full h-full object-cover ${className || ""}`}
      />
    );
  }
  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center ${className || ""}`}>
      <div className="text-brand/20 font-heading text-4xl font-bold">
        {product.categoryLabel.slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, cart }: { product: Product; onClose: () => void; cart: ReturnType<typeof useCart> }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>

        <div className="relative w-full aspect-[16/8] rounded-t-2xl overflow-hidden">
          <ProductImage product={product} />
          {product.featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-white text-xs font-semibold shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            {product.categoryLabel}
          </p>
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            {product.description}
          </p>

          <div className="flex items-baseline gap-2 mb-5">
            <span className="font-heading text-2xl font-bold text-brand">
              {product.price}
            </span>
            <span className="text-sm text-gray-400">{product.unit}</span>
            {product.availability && (
              <span
                className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.availability === "Verfügbar"
                    ? "bg-green-50 text-green-600"
                    : product.availability === "Auf Anfrage"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-500"
                }`}
              >
                {product.availability}
              </span>
            )}
          </div>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Technische Daten
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (cart.isInCart(product.id)) {
                cart.removeItem(product.id);
              } else {
                cart.addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  unit: product.unit,
                  category: product.category,
                  categoryLabel: product.categoryLabel,
                });
              }
            }}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand/20 ${
              cart.isInCart(product.id)
                ? "bg-brand text-white"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {cart.isInCart(product.id) ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ausgewählt — erneut klicken zum Entfernen
              </>
            ) : (
              "Zur Anfrage hinzufügen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventarPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data as Product[]).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
        setProducts(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* HERO */}
      <section className="pt-32 pb-12 text-center bg-gradient-to-b from-gray-50 to-white">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Equipment <span className="text-brand">mieten</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed px-6">
          Professionelle Veranstaltungstechnik — von Line Arrays bis LED Walls.
          Faire Preise, top Zustand, schneller Service.
        </p>
      </section>

      {/* FILTERS */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        <div className="mb-5">
          <div className="relative inline-block">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Equipment suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === cat.key
                  ? "bg-brand/10 border-brand/30 text-brand"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Lade Produkte…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Keine Produkte gefunden.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <ProductImage product={product} />
                  {product.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-semibold shadow-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand mb-1">
                    {product.categoryLabel}
                  </p>
                  <h3 className="font-heading text-base font-semibold text-gray-900 mb-1.5">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="font-heading text-2xl font-bold text-brand mb-4">
                    {product.price}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      {product.unit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all"
                    >
                      Mehr Infos
                    </button>
                    <button
                      onClick={() => {
                        if (cart.isInCart(product.id)) {
                          cart.removeItem(product.id);
                        } else {
                          cart.addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            unit: product.unit,
                            category: product.category,
                            categoryLabel: product.categoryLabel,
                          });
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        cart.isInCart(product.id)
                          ? "bg-brand border-brand text-white"
                          : "bg-brand/5 border-brand/20 text-brand hover:bg-brand hover:text-white hover:border-brand"
                      }`}
                    >
                      {cart.isInCart(product.id) ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Ausgewählt
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Auswählen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cart={cart}
        />
      )}

      {/* Sticky Cart Bar */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand text-white text-sm font-bold flex-shrink-0">
                {cart.items.length}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {cart.items.length === 1
                    ? "1 Artikel ausgewählt"
                    : `${cart.items.length} Artikel ausgewählt`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {cart.items.map((i) => i.name).join(", ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => cart.clearCart()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Leeren
              </button>
              <Link
                href="/anfrage"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Jetzt anfragen
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
