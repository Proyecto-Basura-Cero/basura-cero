import Link from "next/link";
import { experiments } from "@/lib/mock-data";

export default function ExperimentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-700">Biblioteca de 52 experimentos</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={`/experimentos/${exp.weekNumber}`}
            className="rounded-2xl border border-emerald-100 bg-white p-4 hover:border-emerald-300"
          >
            <p className="text-sm text-slate-500">Semana {exp.weekNumber}</p>
            <h2 className="mt-1 font-bold text-emerald-700">{exp.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{exp.objective}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
