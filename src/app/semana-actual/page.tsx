import Link from "next/link";
import { experiments } from "@/lib/mock-data";
import { QrAccessCard } from "@/components/qr/qr-access-card";

export default function CurrentWeekPage() {
  const experiment = experiments[11];
  const currentUrl = `https://basuracero.school/experimentos/${experiment.weekNumber}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <p className="text-sm font-semibold text-emerald-700">Semana #{experiment.weekNumber}</p>
        <h1 className="mt-2 text-3xl font-bold">{experiment.title}</h1>
        <p className="mt-3 text-sm text-slate-700">{experiment.objective}</p>
        <div className="mt-5 flex gap-3">
          <Link href={`/experimentos/${experiment.weekNumber}`} className="rounded-xl bg-emerald-600 px-4 py-2 text-white">
            Ver detalle
          </Link>
          <a href={experiment.printableUrl} className="rounded-xl border border-emerald-300 px-4 py-2 text-emerald-700">
            Descargar ficha
          </a>
        </div>
      </section>
      <QrAccessCard url={currentUrl} />
    </div>
  );
}
