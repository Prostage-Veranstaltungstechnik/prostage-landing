"use client";

import { FormEvent, useState } from "react";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setNotice("");
    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: data.get("website") || "", startedAt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Senden fehlgeschlagen.");
      setStatus("sent");
      setNotice(
        result.mailSent
          ? "Vielen Dank! Deine Nachricht wurde an info@prostage.de gesendet."
          : "Vielen Dank! Deine Nachricht wurde gespeichert. Der E-Mail-Versand ist derzeit noch nicht konfiguriert."
      );
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setStartedAt(Date.now());
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Senden fehlgeschlagen.");
    }
  }

  return (
    <>
      <section className="bg-[#f7f9fc] pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div className="page-shell grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end">
          <div>
            <div className="eyebrow">Kontakt</div>
            <h1 className="display-title">Erzähl uns, was du vorhast.</h1>
          </div>
          <p className="body-copy">Je mehr wir über Ort, Termin und Rahmen wissen, desto gezielter können wir dich beraten.</p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="page-shell grid gap-12 lg:grid-cols-[.68fr_1.32fr] lg:gap-20">
          <aside>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">Direkter Kontakt</p>
            <div className="mt-7 space-y-7">
              <div>
                <p className="text-sm text-slate-500">Allgemeine Anfragen</p>
                <a href="mailto:info@prostage.de" className="mt-1 block font-heading text-xl font-bold text-slate-950 hover:text-brand">info@prostage.de</a>
              </div>
              <div>
                <p className="text-sm text-slate-500">Vermietung</p>
                <a href="mailto:sales@prostage.de" className="mt-1 block font-heading text-xl font-bold text-slate-950 hover:text-brand">sales@prostage.de</a>
              </div>
              <div>
                <p className="text-sm text-slate-500">Telefon</p>
                <a href="tel:+491638653411" className="mt-1 block font-heading text-xl font-bold text-slate-950 hover:text-brand">+49 163 8653411</a>
              </div>
              <div>
                <p className="text-sm text-slate-500">Standort</p>
                <p className="mt-1 font-semibold leading-6 text-slate-800">Humboldtstraße 19<br />67655 Kaiserslautern</p>
              </div>
            </div>
            <div className="mt-10 rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-light">Equipment mieten?</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Produkte auswählen und als gebündelte Mietanfrage senden.</p>
              <a href="/mieten" className="mt-5 inline-flex text-sm font-bold text-white">Zur Vermietung →</a>
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label>
                <span className="field-label">Name *</span>
                <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="field-control" placeholder="Vor- und Nachname" />
              </label>
              <label>
                <span className="field-label">E-Mail *</span>
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="field-control" placeholder="name@unternehmen.de" />
              </label>
              <label>
                <span className="field-label">Telefon</span>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="field-control" placeholder="+49 ..." />
              </label>
              <label>
                <span className="field-label">Betreff</span>
                <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className="field-control" placeholder="Worum geht es?" />
              </label>
            </div>
            <label className="mt-6 block">
              <span className="field-label">Nachricht *</span>
              <textarea required rows={7} value={form.message} onChange={(e) => update("message", e.target.value)} className="field-control resize-y" placeholder="Termin, Ort, Art der Veranstaltung und alles, was wir wissen sollten ..." />
            </label>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-5 text-slate-400">Deine Nachricht wird gespeichert und direkt an info@prostage.de weitergeleitet.</p>
              <button type="submit" disabled={status === "sending"} className="primary-button shrink-0 disabled:cursor-wait disabled:opacity-60">
                {status === "sending" ? "Wird gesendet …" : "Nachricht senden →"}
              </button>
            </div>
            {notice && (
              <p className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
              }`}>
                {notice}
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
