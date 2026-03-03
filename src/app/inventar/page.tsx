"use client";

import { useState } from "react";
import Link from "next/link";
import products from "@/data/products.json";

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

const categories = [
  { key: "all", label: "Alle" },
  { key: "ton", label: "Tontechnik" },
  { key: "licht", label: "Lichttechnik" },
  { key: "buehne", label: "Bühnentechnik" },
  { key: "video", label: "Video" },
];

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all z-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>

        {/* Header image area */}
        <div className="w-full aspect-[16/8] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center rounded-t-2xl">
          <div className="text-brand/20 font-heading text-6xl font-bold">
            {product.categoryLabel.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Content */}
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
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {product.availability}
              </span>
            )}
          </div>

          {/* Specs */}
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

          <Link
            href={`/anfrage?produkt=${encodeURIComponent(product.name)}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
          >
            Jetzt anfragen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function InventarPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = (products as unknown as Product[]).filter((p) => {
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
        {filtered.length === 0 ? (
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
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <div className="text-brand/30 font-heading text-4xl font-bold">
                    {product.categoryLabel.slice(0, 2).toUpperCase()}
                  </div>
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
                    <Link
                      href={`/anfrage?produkt=${encodeURIComponent(product.name)}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand hover:text-white hover:border-brand transition-all"
                    >
                      Anfragen
                    </Link>
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
        />
      )}
    </>
  );
}
