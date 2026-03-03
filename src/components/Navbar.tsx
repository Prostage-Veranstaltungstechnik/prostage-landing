"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="ProStage"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#leistungen"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Leistungen
            </Link>
            <Link
              href="/inventar"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Inventar
            </Link>
            <Link
              href="/#ueber"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Über uns
            </Link>
            <Link
              href="/anfrage"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Kontakt
            </Link>
            <Link
              href="/anfrage"
              className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors shadow-md shadow-brand/20"
            >
              Jetzt anfragen
            </Link>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <span
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          <Link
            href="/#leistungen"
            className="text-2xl font-semibold text-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            Leistungen
          </Link>
          <Link
            href="/inventar"
            className="text-2xl font-semibold text-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            Inventar
          </Link>
          <Link
            href="/#ueber"
            className="text-2xl font-semibold text-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            Über uns
          </Link>
          <Link
            href="/anfrage"
            className="text-2xl font-semibold text-gray-800"
            onClick={() => setMenuOpen(false)}
          >
            Kontakt
          </Link>
          <Link
            href="/anfrage"
            className="bg-brand text-white px-8 py-3 rounded-lg text-lg font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Jetzt anfragen
          </Link>
        </div>
      )}
    </>
  );
}
