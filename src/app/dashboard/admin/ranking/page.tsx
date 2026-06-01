import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AdminRankingFilters } from "@/components/admin/admin-ranking-filters";
import { LeaderboardTable } from "@/components/gamification/leaderboard-table";
import { getAdminSchoolId } from "@/lib/auth-admin";
import {
  getDistinctGrades,
  getGroupRanking
} from "@/lib/services/group-ranking";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function AdminRankingPage({ searchParams }: Props) {
  const { grade } = await searchParams;
  const schoolId = await getAdminSchoolId();

  let rows: Awaited<ReturnType<typeof getGroupRanking>> = [];
  let grades: string[] = [];

  if (schoolId) {
    try {
      [rows, grades] = await Promise.all([
        getGroupRanking({ schoolId, grade: grade || undefined }),
        getDistinctGrades(schoolId)
      ]);
    } catch {
      rows = [];
      grades = [];
    }
  }

  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-emerald-700">Ranking por filtros</h1>
          <p className="text-sm text-slate-600">
            Puntaje acumulado por grupo segun evidencias enviadas y aprobadas.
          </p>
        </header>
        <Suspense
          fallback={
            <div className="rounded-2xl border bg-white p-4 text-sm text-slate-500">
              Cargando filtros...
            </div>
          }
        >
          <AdminRankingFilters grades={grades} currentGrade={grade} />
        </Suspense>
        <LeaderboardTable rows={rows} />
      </div>
    </RoleGuard>
  );
}
