import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anfrage — ProStage Veranstaltungstechnik",
  description: "Stellen Sie eine unverbindliche Anfrage für Veranstaltungstechnik bei ProStage.",
};

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

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Name *
              </label>
              <input
                type="text"
                placeholder="Ihr Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                placeholder="ihre@email.de"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                placeholder="+49 ..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Event-Datum
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Nachricht
            </label>
            <textarea
              rows={5}
              placeholder="Beschreiben Sie Ihr Event — Art der Veranstaltung, Gästeanzahl, benötigte Technik..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all resize-vertical"
            />
          </div>

          <a
            href="mailto:info@prostage.de"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold bg-brand text-white hover:bg-brand-dark transition-all shadow-md shadow-brand/20"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Anfrage senden
          </a>

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
        </div>
      </div>
    </section>
  );
}
