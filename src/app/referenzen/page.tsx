import Link from "next/link";
import { readReferences } from "@/lib/references";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default async function ReferenzenPage() {
  const references = await readReferences();

  return (
    <>
      <section className="bg-[#07111f] pb-20 pt-16 text-white sm:pb-28 sm:pt-24">
        <div className="page-shell grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end">
          <div>
            <div className="eyebrow !text-brand-light">Referenzen</div>
            <h1 className="font-heading text-4xl font-bold tracking-[-.045em] sm:text-5xl lg:text-6xl">Unterschiedliche Events. Derselbe Anspruch.</h1>
          </div>
          <p className="text-lg leading-8 text-slate-400">Einblicke in Produktionen und technische Setups, die wir für Veranstaltungen realisiert haben.</p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell">
          {references.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {references.map((entry) => (
                <article key={entry.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-slate-900/5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.image} alt={entry.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <p className="absolute bottom-5 left-5 rounded-full border border-white/25 bg-slate-950/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-white backdrop-blur-md">{entry.type}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="text-brand">●</span>{entry.location}</span>
                      <time dateTime={entry.eventDate}>{formatDate(entry.eventDate)}</time>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-slate-950">{entry.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{entry.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <p className="font-heading text-2xl font-bold text-slate-900">Referenzen folgen in Kürze.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Aktuelle Projekte werden derzeit für die Veröffentlichung vorbereitet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="page-shell text-center">
          <div className="rounded-[2rem] bg-slate-50 px-6 py-14 sm:px-12">
            <div className="eyebrow">Dein Projekt</div>
            <h2 className="mx-auto max-w-3xl font-heading text-3xl font-bold tracking-[-.04em] text-slate-950 sm:text-4xl">Das nächste überzeugende Setup könnte deins sein.</h2>
            <Link href="/kontakt" className="primary-button mt-8">Unverbindlich anfragen →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
