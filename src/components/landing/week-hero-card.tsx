import Link from "next/link";

export function WeekHeroCard({ weekNumber }: { weekNumber: number }) {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-6 text-white">
      <p className="text-sm font-semibold">Semana activa</p>
      <h1 className="mt-2 text-3xl font-bold">Reto ecologico #{weekNumber}</h1>
      <p className="mt-2 max-w-xl text-sm text-emerald-50">
        Activa a tu grupo con un experimento semanal de reciclaje, reutilizacion y medicion de impacto.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/semana-actual" className="rounded-xl bg-white px-4 py-2 font-semibold text-emerald-700">
          Ver semana actual
        </Link>
        <Link href="/ranking" className="rounded-xl border border-white px-4 py-2 font-semibold text-white">
          Ver ranking
        </Link>
      </div>
    </section>
  );
}
