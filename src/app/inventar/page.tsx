"use client";

import { useState } from "react";
import Link from "next/link";
import products from "@/data/products.json";

const categories = [
  { key: "all", label: "Alle" },
  { key: "ton", label: "Tontechnik" },
  { key: "licht", label: "Lichttechnik" },
  { key: "buehne", label: "Bühnentechnik" },
  { key: "video", label: "Video" },
];

export default function InventarPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

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
                  <Link
                    href={`/anfrage?produkt=${encodeURIComponent(product.name)}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold bg-brand/5 border border-brand/20 text-brand hover:bg-brand hover:text-white hover:border-brand transition-all"
                  >
                    Anfragen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
