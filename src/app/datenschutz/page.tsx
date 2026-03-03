import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — ProStage Veranstaltungstechnik",
};

export default function DatenschutzPage() {
  return (
    <section className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 mb-10">
          Datenschutzerklärung
        </h1>

        <div className="space-y-8 text-gray-600 text-base leading-relaxed">
          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              1. Verantwortlicher
            </h2>
            <p>
              ProStage GmbH (i.Gr.)
              <br />
              [Adresse folgt]
              <br />
              E-Mail:{" "}
              <a href="mailto:info@prostage.de" className="text-brand hover:underline">
                info@prostage.de
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              2. Erhebung und Verarbeitung personenbezogener Daten
            </h2>
            <p>
              Wenn Sie uns per E-Mail kontaktieren oder eine Anfrage über
              unsere Website stellen, werden die von Ihnen mitgeteilten Daten
              (Name, E-Mail-Adresse, Telefonnummer, Nachricht) ausschließlich
              zur Bearbeitung Ihrer Anfrage verwendet. Die Verarbeitung
              erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse).
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              3. Keine Cookies und kein Tracking
            </h2>
            <p>
              Diese Website verwendet keine Cookies, keine Tracking-Tools und
              keine Analyse-Software. Es werden keine Nutzungsprofile
              erstellt.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              4. Hosting
            </h2>
            <p>
              Diese Website wird gehostet. Beim Aufruf der Seite werden
              technisch bedingt Daten (z.B. IP-Adresse, Zeitpunkt des
              Zugriffs) an die Server des Hosters übermittelt.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              5. Weitergabe an Dritte
            </h2>
            <p>
              Ihre personenbezogenen Daten werden nicht an Dritte
              weitergegeben, es sei denn, dies ist zur Vertragserfüllung
              erforderlich oder Sie haben ausdrücklich eingewilligt.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              6. Ihre Rechte
            </h2>
            <p className="mb-3">Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Auskunft über die bei uns gespeicherten Daten (Art. 15 DSGVO)
              </li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>
                Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)
              </li>
            </ul>
            <p className="mt-3">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href="mailto:info@prostage.de" className="text-brand hover:underline">
                info@prostage.de
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-gray-900 mb-3">
              7. Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
              personenbezogenen Daten zu beschweren.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
