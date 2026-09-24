"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/mieten", label: "Mieten" },
  { href: "/referenzen", label: "Referenzen" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/wartung")) return null;

  return (
    <>
      <nav
        className={`relative z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "bg-white/70 backdrop-blur-md"
        }`}
        aria-label="Hauptnavigation"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="relative z-50 flex items-center" aria-label="ProStage Startseite">
            <Image src="/logo.png" alt="ProStage" width={132} height={40} className="h-9 w-auto" priority />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/mieten" className="ml-3 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              Equipment anfragen
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <button
            type="button"
            className="relative z-50 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            <span className="sr-only">Menü</span>
            <span className="relative block h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 bg-white px-6 pt-28 transition duration-300 lg:hidden ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="mx-auto flex max-w-lg flex-col">
          {navigation.map((item, index) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between border-b border-slate-100 py-5 font-heading text-2xl font-semibold text-slate-950">
              <span>{item.label}</span>
              <span className="text-sm font-normal text-slate-400">0{index + 1}</span>
            </Link>
          ))}
          <Link href="/mieten" className="mt-8 rounded-2xl bg-brand px-6 py-4 text-center font-bold text-white">Equipment anfragen</Link>
        </div>
      </div>
    </>
  );
}
