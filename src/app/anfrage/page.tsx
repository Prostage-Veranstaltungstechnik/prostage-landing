"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const leistungen = [
  { key: "fullservice", label: "FullService Events" },
  { key: "tontechnik", label: "Tontechnik" },
  { key: "lichttechnik", label: "Lichttechnik" },
  { key: "vermietung", label: "Vermietung" },
];

function AnfrageForm() {
  const searchParams = useSearchParams();
  const produkt = searchParams.get("produkt") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    telefon: "",
    von: "",
    bis: "",
    nachricht: produkt ? `Anfrage zu: ${produkt}\n\n` : "",
    leistungen: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function toggleLeistung(key: string) {
    setForm((prev) => ({
      ...prev,
      leistungen: prev.leistungen.includes(key)
        ? prev.leistungen.filter((l) => l !== key)
        : [...prev.leistungen, key],
    }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name ist erforderlich.";
    if (!form.email.trim()) errs.email = "E-Mail ist erforderlich.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Bitte eine gültige E-Mail eingeben.";
    if (!form.von) errs.von = "Startdatum ist erforderlich.";
    if (!form.bis) errs.bis = "Enddatum ist erforderlich.";
    if (form.von && form.bis && form.von > form.bis)
      errs.bis = "Enddatum muss nach Startdatum liegen.";
    if (!form.nachricht.trim()) errs.nachricht = "Nachricht ist erforderlich.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Anfrage gesendet!</h2>
        <p className="text-gray-500">
          Vielen Dank für Ihre Anfrage. Wir melden uns schnellstmöglich bei Ihnen.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all";
  const errorInputClass =
    "w-full px-4 py-3 rounded-xl border border-red-300 bg-red-50/30 text-gray-900 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all";

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Zeitraum */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Zeitraum</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Von *
          </label>
          <input
            type="date"
            value={form.von}
            onChange={(e) => setForm({ ...form, von: e.target.value })}
            className={errors.von ? errorInputClass : inputClass}
          />
          {errors.von && <p className="text-xs text-red-500 mt-1">{errors.von}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Bis *
          </label>
          <input
            type="date"
            value={form.bis}
            onChange={(e) => setForm({ ...form, bis: e.target.value })}
            className={errors.bis ? errorInputClass : inputClass}
          />
          {errors.bis && <p className="text-xs text-red-500 mt-1">{errors.bis}</p>}
        </div>
      </div>

      {/* Leistungsauswahl */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Leistungsauswahl</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {leistungen.map((l) => (
          <label
            key={l.key}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
              form.leistungen.includes(l.key)
                ? "bg-brand/5 border-brand/30 text-brand"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <input
              type="checkbox"
              checked={form.leistungen.includes(l.key)}
              onChange={() => toggleLeistung(l.key)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                form.leistungen.includes(l.key) ? "bg-brand border-brand" : "border-gray-300"
              }`}
            >
              {form.leistungen.includes(l.key) && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1.5 5 4 7.5 8.5 2.5" />
                </svg>
              )}
            </span>
            {l.label}
          </label>
        ))}
      </div>

      {/* Kontaktdaten */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Kontaktdaten</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Name *
          </label>
          <input
            type="text"
            placeholder="Ihr Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={errors.name ? errorInputClass : inputClass}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            E-Mail *
          </label>
          <input
            type="email"
            placeholder="ihre@email.de"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={errors.email ? errorInputClass : inputClass}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Telefon <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="tel"
          placeholder="+49 ..."
          value={form.telefon}
          onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Nachricht *
        </label>
        <textarea
          rows={5}
          placeholder="Beschreiben Sie Ihr Event — Art der Veranstaltung, Gästeanzahl, benötigte Technik..."
          value={form.nachricht}
          onChange={(e) => setForm({ ...form, nachricht: e.target.value })}
          className={`${errors.nachricht ? errorInputClass : inputClass} resize-vertical`}
        />
        {errors.nachricht && <p className="text-xs text-red-500 mt-1">{errors.nachricht}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Wird gesendet…
          </>
        ) : (
          <>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Anfrage senden
          </>
        )}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-500 text-center mt-3">
          Fehler beim Senden. Bitte versuchen Sie es erneut.
        </p>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        Oder direkt per E-Mail:{" "}
        <a href="mailto:info@prostage.de" className="text-brand hover:underline">
          info@prostage.de
        </a>{" "}
        · Telefon:{" "}
        <a href="tel:+491234567890" className="text-brand hover:underline">
          +49 123 456 7890
        </a>
      </p>
    </form>
  );
}

export default function AnfragePage() {
  return (
    <section className="pt-32 pb-24 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
          — Kontakt
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Jetzt <span className="text-brand">anfragen</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-12">
          Erzählen Sie uns von Ihrem Event — wir erstellen Ihnen ein
          maßgeschneidertes Angebot. Unverbindlich und kostenfrei.
        </p>

        <Suspense fallback={<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm animate-pulse h-96" />}>
          <AnfrageForm />
        </Suspense>
      </div>
    </section>
  );
}
