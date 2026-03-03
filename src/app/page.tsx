import Link from "next/link";

const services = [
  {
    title: "FullService Events",
    description:
      "Firmenevents, Partys, Bandauftritte — wir liefern das komplette technische Setup aus einer Hand, von der Planung bis zum Abbau.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Tontechnik",
    description:
      "Kristallklarer Sound für jede Venue-Größe. Line-Arrays, Monitorsysteme und digitale Mischpulte der neuesten Generation.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M1 12h3m14 0h3M12 1v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </svg>
    ),
  },
  {
    title: "Lichttechnik",
    description:
      "Atmosphärische Lichtdesigns mit Moving Heads, LED-Bars, Followspots und intelligenten Steuerungen für jede Stimmung.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M7 8V6a5 5 0 0110 0v2" />
      </svg>
    ),
  },
  {
    title: "Vermietung",
    description:
      "Professionelle Veranstaltungstechnik flexibel mieten — tageweise zum Festpreis, top Zustand, schneller Service.",
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 20V10m6 10V4M6 20v-4" />
      </svg>
    ),
  },
];

const features = [
  "Eigener Gerätepark auf neuestem Stand",
  "Flexibel und zuverlässig",
  "Persönliche Betreuung von der Planung bis zum Abbau",
  "Sorgfältige Planung & saubere technische Umsetzung",
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-brand/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 py-32">
          <div className="inline-flex items-center gap-2 bg-brand/5 border border-brand/15 rounded-full px-4 py-1.5 text-sm font-medium text-brand mb-8">
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
            Veranstaltungstechnik auf höchstem Niveau
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Wir machen dein Event{" "}
            <span className="text-brand">unvergesslich</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Modernste Ton-, Licht- und Bühnentechnik für Events, die
            begeistern. Von der Konzeption bis zur Durchführung — alles aus
            einer Hand.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/anfrage"
              className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Jetzt anfragen
            </Link>
            <Link
              href="/#leistungen"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all hover:-translate-y-0.5"
            >
              Unsere Leistungen
            </Link>
          </div>
        </div>
      </section>

      {/* LEISTUNGEN */}
      <section id="leistungen" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
              — Was wir bieten
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Unsere Leistungen
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Wir liefern das komplette Spektrum professioneller
              Veranstaltungstechnik — von der kleinen Konferenz bis zur großen
              Bühnenshow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand/20 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-5">
                  {service.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPMENT CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
            — Equipment mieten
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Professionelle Veranstaltungstechnik
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Tontechnik, Lichttechnik, Bühnentechnik und mehr — flexibel mieten,
            tageweise zum Festpreis.
          </p>
          <Link
            href="/inventar"
            className="inline-flex items-center gap-3 bg-brand text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
          >
            Unser Equipment entdecken
            <span className="text-xl">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ÜBER UNS */}
      <section id="ueber" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
                — Wer wir sind
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Technik ist unsere Leidenschaft
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Mit gebündelter Expertise in Licht und Ton realisieren wir Ihre
                Events – persönlich, zuverlässig und auf höchstem technischem
                Niveau. Vom intimen Firmenevent bis zur großen Party verbinden
                wir kreativen Anspruch mit moderner Technik, damit Ihre
                Veranstaltung in Erinnerung bleibt.
              </p>
              <div className="flex flex-col gap-3">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand text-sm flex-shrink-0">
                      &#10003;
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
              <div className="absolute w-[60%] h-[60%] rounded-full border border-brand/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[80%] h-[80%] rounded-full border border-brand/10 animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute w-[95%] h-[95%] rounded-full border border-brand/5 animate-[spin_40s_linear_infinite]" />
              <div className="relative z-10 text-center">
                <div className="font-heading text-6xl font-extrabold bg-gradient-to-br from-brand to-brand-light bg-clip-text text-transparent">
                  PS
                </div>
                <p className="text-gray-400 text-sm mt-1">Pro &middot; Stage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-3">
            — Bereit für dein Event?
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lass uns gemeinsam etwas Großes schaffen
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Erzähl uns von deinem Projekt — wir erstellen dir ein
            maßgeschneidertes Angebot. Unverbindlich und kostenfrei.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/anfrage"
              className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Jetzt anfragen
            </Link>
            <a
              href="tel:+491234567890"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all hover:-translate-y-0.5"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              Anrufen
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
