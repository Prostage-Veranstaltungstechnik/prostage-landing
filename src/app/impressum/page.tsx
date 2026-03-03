import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum — ProStage Veranstaltungstechnik",
};

export default function ImpressumPage() {
  return (
    <section className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 mb-10">
          Impressum
        </h1>

        <div className="space-y-8 text-gray-600 text-base leading-relaxed">
          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              ProStage GmbH (i.Gr.)
              <br />
              [Adresse folgt]
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Vertreten durch
            </h2>
            <p>Geschäftsführer: [Name folgt]</p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Kontakt
            </h2>
            <p>
              E-Mail:{" "}
              <a href="mailto:info@prostage.de" className="text-brand hover:underline">
                info@prostage.de
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a
              Umsatzsteuergesetz:
              <br />
              [folgt]
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Haftungsausschluss
            </h2>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen.
            </p>
            <p className="mt-3">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
              gespeicherte fremde Informationen zu überwachen.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen
              der schriftlichen Zustimmung des jeweiligen Autors bzw.
              Erstellers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
