import Link from "next/link";
import type { Route } from "next";
import type { CurrentChallenge } from "@/lib/services/current-challenge";

type Props = {
  challenge: CurrentChallenge | null;
};

export function WeekHeroCard({ challenge }: Props) {
  if (!challenge) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-semibold text-amber-800">Semana activa</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-900">
          Aun no hay reto activo
        </h1>
        <p className="mt-2 max-w-xl text-sm text-amber-900">
          Cuando el administrador active la semana, aqui aparecera el experimento
          en curso. Mientras tanto puedes explorar la biblioteca completa.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/experimentos"
            className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Ver experimentos
          </Link>
          <Link
            href="/ranking"
            className="rounded-xl border border-amber-300 px-4 py-2 font-semibold text-amber-900"
          >
            Ver ranking
          </Link>
        </div>
      </section>
    );
  }

  const experimentUrl = `/experimentos/${challenge.weekNumber}` as Route;

  return (
    <section className="rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-6 text-white">
      <p className="text-sm font-semibold">Semana activa #{challenge.weekNumber}</p>
      <h1 className="mt-2 text-3xl font-bold">{challenge.title}</h1>
      <p className="mt-2 max-w-xl text-sm text-emerald-50">{challenge.objective}</p>
      <p className="mt-2 text-xs text-emerald-100">
        Periodo: {challenge.startDate} a {challenge.endDate}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/semana-actual"
          className="rounded-xl bg-white px-4 py-2 font-semibold text-emerald-700"
        >
          Ver semana actual
        </Link>
        <Link
          href={experimentUrl}
          className="rounded-xl border border-white px-4 py-2 font-semibold text-white"
        >
          Ver experimento
        </Link>
        <Link
          href="/ranking"
          className="rounded-xl border border-white px-4 py-2 font-semibold text-white"
        >
          Ver ranking
        </Link>
      </div>
    </section>
  );
}
