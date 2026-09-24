import Link from "next/link";

const values = [
  ["Persönlich", "Ein fester Kontakt, kurze Wege und ehrliche Empfehlungen statt Technik von der Stange."],
  ["Präzise", "Wir planen jedes Detail passend zu Raum, Ablauf, Publikum und den Anforderungen vor Ort."],
  ["Verlässlich", "Gepflegtes Material, klare Absprachen und ein Team, das auch dann ruhig bleibt, wenn es zählt."],
];

export default function UeberUnsPage() {
  return (
    <>
      <section className="overflow-hidden bg-[#f7f9fc] pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="page-shell grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <div className="eyebrow">Über ProStage</div>
            <h1 className="display-title">Technik ist unser Werkzeug. Begeisterung unser Anspruch.</h1>
          </div>
          <p className="body-copy max-w-xl lg:justify-self-end">
            Wir verbinden technisches Know-how mit einem klaren Blick für das große Ganze. So entstehen Veranstaltungen, bei denen Technik nicht ablenkt, sondern den Moment trägt.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#07111f]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(0,119,255,.55),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(0,170,255,.25),transparent_25%)]" />
            <div className="absolute left-[12%] top-0 h-[75%] w-px rotate-[24deg] bg-gradient-to-b from-white/70 to-transparent shadow-[0_0_28px_10px_rgba(0,119,255,.3)]" />
            <div className="absolute right-[18%] top-0 h-[70%] w-px -rotate-[18deg] bg-gradient-to-b from-white/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-light">ProStage</p>
              <p className="mt-2 max-w-xs font-heading text-3xl font-bold text-white">Professionelle Technik. Nahbar umgesetzt.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="eyebrow">Unser Antrieb</div>
            <h2 className="font-heading text-3xl font-bold tracking-[-.035em] text-slate-950 sm:text-4xl">Damit am Ende alles einfach wirkt.</h2>
            <div className="mt-7 space-y-5 text-base leading-7 text-slate-600">
              <p>Gute Veranstaltungstechnik beginnt lange vor dem ersten Ton. Wir hören zu, stellen die richtigen Fragen und entwickeln ein Setup, das zum Anlass und zum Budget passt.</p>
              <p>Ob einzelne Mietkomponente oder technische Gesamtbetreuung: Unser Anspruch bleibt derselbe – sauber planen, sorgfältig umsetzen und zuverlässig ansprechbar sein.</p>
            </div>
            <Link href="/kontakt" className="primary-button mt-9 self-start">Projekt besprechen →</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="page-shell">
          <div className="eyebrow">Wofür wir stehen</div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {values.map(([title, copy], index) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7">
                <span className="font-mono text-xs font-bold text-brand">0{index + 1}</span>
                <h2 className="mt-8 font-heading text-2xl font-bold text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell flex flex-col gap-7 rounded-[2rem] bg-brand px-7 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">Equipment benötigt?</p>
            <h2 className="mt-3 font-heading text-3xl font-bold">Stell deine Mietanfrage direkt zusammen.</h2>
          </div>
          <Link href="/mieten" className="inline-flex shrink-0 self-start rounded-full bg-white px-6 py-3.5 text-sm font-bold text-brand lg:self-auto">Zum Equipment →</Link>
        </div>
      </section>
    </>
  );
}
