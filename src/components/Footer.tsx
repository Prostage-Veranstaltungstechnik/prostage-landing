"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const siteLinks = [
  ["Home", "/"],
  ["Über uns", "/ueber-uns"],
  ["Mieten", "/mieten"],
  ["Referenzen", "/referenzen"],
  ["Kontakt", "/kontakt"],
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/wartung")) return null;

  return (
    <footer className="bg-[#07111f] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.4fr_.7fr_.9fr]">
          <div>
            <Image src="/logo.png" alt="ProStage" width={140} height={42} className="mb-6 h-10 w-auto brightness-0 invert" />
            <p className="max-w-md text-base leading-7 text-slate-400">
              Veranstaltungstechnik aus Kaiserslautern. Durchdacht geplant, zuverlässig umgesetzt und persönlich betreut.
            </p>
            <a href="https://www.instagram.com/prostage_official" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-light">
              Instagram <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div>
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white">Navigation</h2>
            <div className="flex flex-col gap-3">
              {siteLinks.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-slate-400 transition hover:text-white">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white">Kontakt</h2>
            <div className="space-y-3 text-sm text-slate-400">
              <a href="mailto:info@prostage.de" className="block transition hover:text-white">info@prostage.de</a>
              <a href="mailto:sales@prostage.de" className="block transition hover:text-white">sales@prostage.de</a>
              <a href="tel:+491638653411" className="block transition hover:text-white">+49 163 8653411</a>
              <p>Humboldtstraße 19<br />67655 Kaiserslautern</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ProStage. Alle Rechte vorbehalten.</span>
          <div className="flex gap-5">
            <Link href="/impressum" className="hover:text-white">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
