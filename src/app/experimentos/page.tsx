import Link from "next/link";
import { getPublishedExperiments } from "@/lib/services/experiments";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  let experiments: Awaited<ReturnType<typeof getPublishedExperiments>> = [];
  try {
    experiments = await getPublishedExperiments();
  } catch {
    experiments = [];
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-700">
        Biblioteca de experimentos
      </h1>
      {experiments.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
          Aun no hay experimentos publicados.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((exp) => (
            <Link
              key={exp.id}
              href={`/experimentos/${exp.weekNumber}`}
              className="rounded-2xl border border-emerald-100 bg-white p-4 hover:border-emerald-300"
            >
              <p className="text-sm text-slate-500">Semana {exp.weekNumber}</p>
              <h2 className="mt-1 font-bold text-emerald-700">{exp.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {exp.objective}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
