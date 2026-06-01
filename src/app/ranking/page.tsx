import { LeaderboardTable } from "@/components/gamification/leaderboard-table";
import { RankingPodium } from "@/components/gamification/ranking-podium";
import {
  getGroupRanking,
  resolveRankingSchoolId
} from "@/lib/services/group-ranking";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const schoolId = await resolveRankingSchoolId();

  let rows: Awaited<ReturnType<typeof getGroupRanking>> = [];
  try {
    rows = await getGroupRanking(schoolId ? { schoolId } : {});
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-emerald-700">Ranking de grupos</h1>
        <p className="text-sm text-slate-600">
          {schoolId
            ? "Clasificacion de tu escuela por puntos acumulados."
            : "Clasificacion general. Inicia sesion para ver el ranking de tu escuela."}
        </p>
      </header>
      <RankingPodium rows={rows} />
      <LeaderboardTable rows={rows} />
    </div>
  );
}
