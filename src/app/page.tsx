import Link from "next/link";
import { WeekHeroCard } from "@/components/landing/week-hero-card";
import { KpiTiles } from "@/components/metrics/kpi-tiles";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <WeekHeroCard weekNumber={12} />
      <KpiTiles
        items={[
          { label: "Experimentos activos", value: "52" },
          { label: "Grupos participantes", value: "24" },
          { label: "Kg separados", value: "312" },
          { label: "Evidencias", value: "178" }
        ]}
      />
      <section className="rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="text-xl font-bold text-emerald-700">Como funciona</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Consulta el reto semanal.</li>
          <li>Ejecuta la actividad con tu grupo.</li>
          <li>Sube evidencia y metricas.</li>
          <li>Acumula puntos y gana insignias.</li>
        </ol>
        <Link href="/experimentos" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-white">
          Ver biblioteca de experimentos
        </Link>
      </section>
    </div>
  );
}
