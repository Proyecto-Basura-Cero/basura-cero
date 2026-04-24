import { RoleGuard } from "@/components/auth/role-guard";
import { LeaderboardTable } from "@/components/gamification/leaderboard-table";

export default async function AdminRankingPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-emerald-700">Ranking por filtros</h1>
        <form className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3">
          <select className="rounded border p-2">
            <option>Todos los grados</option>
            <option>3ro</option>
            <option>4to</option>
            <option>5to</option>
            <option>6to</option>
          </select>
          <select className="rounded border p-2">
            <option>Periodo actual</option>
            <option>Mensual</option>
            <option>Trimestral</option>
          </select>
          <button className="rounded bg-emerald-600 px-3 py-2 text-white" type="button">
            Aplicar filtros
          </button>
        </form>
        <LeaderboardTable />
      </div>
    </RoleGuard>
  );
}
