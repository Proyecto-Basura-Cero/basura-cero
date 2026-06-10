import Link from "next/link";
import { WeekHeroCard } from "@/components/landing/week-hero-card";
import { KpiTiles } from "@/components/metrics/kpi-tiles";
import { formatAdminKpiValue } from "@/lib/services/admin-kpis";
import { getFeaturedChallenge } from "@/lib/services/current-challenge";
import { getHomeKpis } from "@/lib/services/home-stats";
import { resolveRankingSchoolId } from "@/lib/services/group-ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const schoolId = await resolveRankingSchoolId();

  let challenge: Awaited<ReturnType<typeof getFeaturedChallenge>> = null;
  let kpis: Awaited<ReturnType<typeof getHomeKpis>> = {
    publishedExperiments: 0,
    participatingGroups: 0,
    totalKgSeparated: 0,
    totalReusedItems: 0,
    totalEvidence: 0
  };

  try {
    [challenge, kpis] = await Promise.all([
      getFeaturedChallenge(schoolId),
      getHomeKpis(schoolId)
    ]);
  } catch {
    // Si falla Supabase, se muestran ceros y el estado vacio del reto.
  }

  return (
    <div className="space-y-8">
      <WeekHeroCard challenge={challenge} />
      <KpiTiles
        items={[
          {
            label: "Experimentos publicados",
            value: formatAdminKpiValue(kpis.publishedExperiments)
          },
          {
            label: schoolId ? "Grupos en tu escuela" : "Grupos participantes",
            value: formatAdminKpiValue(kpis.participatingGroups)
          },
          {
            label: "Kg separados",
            value: formatAdminKpiValue(kpis.totalKgSeparated, 1)
          },
          {
            label: "Materiales reutilizados",
            value: formatAdminKpiValue(kpis.totalReusedItems)
          },
          {
            label: "Evidencias enviadas",
            value: formatAdminKpiValue(kpis.totalEvidence)
          }
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
        <Link
          href="/experimentos"
          className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-white"
        >
          Ver biblioteca de experimentos
        </Link>
      </section>
    </div>
  );
}
