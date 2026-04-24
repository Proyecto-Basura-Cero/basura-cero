import { LeaderboardTable } from "@/components/gamification/leaderboard-table";
import { RankingPodium } from "@/components/gamification/ranking-podium";

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-700">Ranking de grupos</h1>
      <RankingPodium />
      <LeaderboardTable />
    </div>
  );
}
