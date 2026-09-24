import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Tontechnik",
    copy: "Klarer, druckvoller Sound – passend dimensioniert für Raum, Publikum und Programm.",
  },
  {
    number: "02",
    title: "Lichttechnik",
    copy: "Lichtkonzepte, die Atmosphäre schaffen und Marken, Bühnen sowie Menschen sichtbar machen.",
  },
  {
    number: "03",
    title: "Full Service",
    copy: "Planung, Technik, Betreuung und Abbau aus einer Hand – mit einem festen Ansprechpartner.",
  },
];

const process = [
  ["Anfrage", "Du beschreibst uns dein Event oder stellst dein Wunsch-Equipment zusammen."],
  ["Planung", "Wir prüfen Verfügbarkeit, Dimensionierung und alle technischen Anforderungen."],
  ["Umsetzung", "Pünktliche Bereitstellung, sauberer Aufbau und verlässliche Betreuung."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f7f9fc] pb-20 pt-16 sm:pb-28 sm:pt-20">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="page-shell relative grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="eyebrow">Veranstaltungstechnik aus Kaiserslautern</div>
            <h1 className="font-heading text-5xl font-bold leading-[.96] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl xl:text-[5.6rem]">
              Technik, die den <span className="text-brand">Moment</span> trägt.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Ton, Licht und Full-Service für Veranstaltungen, die professionell aussehen, stark klingen und reibungslos laufen.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/mieten" className="primary-button">Equipment mieten <span aria-hidden="true">→</span></Link>
              <Link href="/kontakt" className="secondary-button">Event besprechen</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Persönliche Beratung</span>
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Flexibel planbar</span>
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Gepflegter Gerätepark</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-[540px]">
            <div className="absolute inset-6 rounded-[2.5rem] bg-[#07111f] shadow-2xl shadow-slate-900/20" />
            <div className="absolute inset-x-0 top-[14%] h-48 rounded-full bg-brand/30 blur-3xl" />
            <div className="absolute inset-6 overflow-hidden rounded-[2.5rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,119,255,.6),transparent_28%),linear-gradient(180deg,#0b1c34_0%,#050b14_100%)]" />
              <div className="absolute left-[12%] right-[12%] top-[24%] h-px bg-white/30" />
              <div className="absolute left-[20%] top-[15%] h-[55%] w-px rotate-[18deg] bg-gradient-to-b from-white/70 to-transparent shadow-[0_0_22px_8px_rgba(86,173,255,.3)]" />
              <div className="absolute right-[20%] top-[15%] h-[55%] w-px -rotate-[18deg] bg-gradient-to-b from-white/70 to-transparent shadow-[0_0_22px_8px_rgba(86,173,255,.3)]" />
              <div className="absolute bottom-[16%] left-[10%] right-[10%] h-[34%] rounded-t-[45%] border-t border-brand/70 bg-brand/10 shadow-[0_-20px_80px_rgba(0,119,255,.24)]" />
              <div className="absolute bottom-[21%] left-[24%] h-24 w-9 rounded-t-full bg-black/70" />
              <div className="absolute bottom-[21%] left-[47%] h-32 w-10 rounded-t-full bg-black/80" />
              <div className="absolute bottom-[21%] right-[22%] h-20 w-8 rounded-t-full bg-black/70" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.22em] text-brand-light">Sound · Light · Stage</p>
                  <p className="mt-2 max-w-[260px] font-heading text-2xl font-semibold leading-tight text-white">Dein Event. Unsere Bühne.</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white">↗</span>
              </div>
            </div>
            <div className="float-slow absolute -bottom-2 -left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:-left-10">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Alles aus einer Hand</p>
              <p className="mt-1 font-heading text-lg font-bold text-slate-950">Planung bis Abbau</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <div className="eyebrow">Was wir möglich machen</div>
              <h2 className="display-title">Ein Setup, das zu deinem Event passt.</h2>
            </div>
            <div className="grid border-t border-slate-200 sm:grid-cols-3 lg:border-l lg:border-t-0">
              {services.map((service) => (
                <article key={service.number} className="border-b border-slate-200 py-7 sm:border-r sm:px-6 lg:py-3">
                  <span className="font-mono text-xs text-brand">{service.number}</span>
                  <h3 className="mt-8 font-heading text-xl font-bold text-slate-950">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{service.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] py-20 text-white sm:py-28">
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <div className="eyebrow !text-brand-light">Equipment mieten</div>
              <h2 className="font-heading text-4xl font-bold tracking-[-.04em] sm:text-5xl">Profi-Equipment. Einfach ausgewählt.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-slate-400 lg:justify-self-end">
              Durchsuche unser Sortiment, wähle passende Artikel aus und sende uns deine Mietanfrage direkt online.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["Tontechnik", "Lichttechnik", "SFX", "Netzwerktechnik", "Bühne & Kabel"].map((category, index) => (
              <Link key={category} href="/mieten" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.04] p-7 transition hover:-translate-y-1 hover:border-brand/60 hover:bg-brand/10">
                <span className="font-mono text-xs text-slate-500">0{index + 1}</span>
                <div className="mt-16 flex items-end justify-between">
                  <h3 className="min-w-0 font-heading text-xl font-semibold leading-tight sm:text-2xl">{category}</h3>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition group-hover:bg-brand">→</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/mieten" className="primary-button mt-9">Zum gesamten Equipment <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell">
          <div className="max-w-2xl">
            <div className="eyebrow">So läuft es</div>
            <h2 className="display-title">Vom ersten Klick zum fertigen Setup.</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {process.map(([title, copy], index) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white font-mono text-xs font-bold text-brand shadow-sm">{index + 1}</span>
                <h3 className="mt-8 font-heading text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="page-shell">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand px-7 py-12 text-white sm:px-12 sm:py-16">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[50px] border-white/10" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-100">Projekt im Kopf?</p>
              <h2 className="mt-4 font-heading text-4xl font-bold tracking-[-.04em] sm:text-5xl">Lass uns darüber sprechen.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">Wir hören zu, denken mit und planen die Technik so, dass sie am Veranstaltungstag einfach funktioniert.</p>
              <Link href="/kontakt" className="mt-8 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-bold text-brand transition hover:-translate-y-0.5">Kontakt aufnehmen →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
