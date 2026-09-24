import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Wartungsarbeiten — ProStage",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07111f] px-6 py-16 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,#1367d1_0,transparent_32%),radial-gradient(circle_at_85%_80%,#0b3e7a_0,transparent_35%)]" />
      <div className="relative mx-auto max-w-2xl text-center">
        <Image src="/logo.png" alt="ProStage" width={180} height={54} priority className="mx-auto h-auto w-44 brightness-0 invert" />
        <div className="mx-auto mt-12 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-2xl shadow-black/20" aria-hidden="true">⚙</div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.28em] text-brand-light">Kurze Pause</p>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-[-.04em] sm:text-6xl">Wir führen gerade Wartungsarbeiten durch.</h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Unsere Website ist vorübergehend nicht erreichbar. Wir arbeiten daran und sind in Kürze wieder für dich da.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark">Erneut versuchen</Link>
          <a href="mailto:info@prostage.de" className="text-sm font-semibold text-slate-300 transition hover:text-white">info@prostage.de</a>
        </div>
      </div>
    </section>
  );
}
