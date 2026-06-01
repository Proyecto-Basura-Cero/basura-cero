import { ImpactCharts } from "@/components/metrics/impact-charts";
import { LeaderboardTable } from "@/components/gamification/leaderboard-table";
import { RoleGuard } from "@/components/auth/role-guard";
import {
  getGroupRanking,
  resolveRankingSchoolId
} from "@/lib/services/group-ranking";
import { getWeeklyImpactChart } from "@/lib/services/admin-reports";

export const dynamic = "force-dynamic";

export default async function JuryPage() {
  const schoolId = await resolveRankingSchoolId();

  let rows: Awaited<ReturnType<typeof getGroupRanking>> = [];
  let weekly: Awaited<ReturnType<typeof getWeeklyImpactChart>> = [];
  if (schoolId) {
    try {
      [rows, weekly] = await Promise.all([
        getGroupRanking({ schoolId }),
        getWeeklyImpactChart(schoolId)
      ]);
    } catch {
      rows = [];
      weekly = [];
    }
  }

  return (
    <RoleGuard allow={["jury", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700">Vista de jurado</h1>
        <p className="text-sm text-slate-600">
          Consulta de resultados e impacto en modo solo lectura.
        </p>
        <LeaderboardTable rows={rows} />
        <ImpactCharts data={weekly} />
      </div>
    </RoleGuard>
  );
}
