import { ImpactCharts } from "@/components/metrics/impact-charts";
import { LeaderboardTable } from "@/components/gamification/leaderboard-table";

export default function JuryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-700">Vista de jurado</h1>
      <p className="text-sm text-slate-600">Consulta de resultados e impacto en modo solo lectura.</p>
      <LeaderboardTable />
      <ImpactCharts />
    </div>
  );
}
