import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { KpiTiles } from "@/components/metrics/kpi-tiles";
import { getAdminSchoolId } from "@/lib/auth-admin";
import {
  formatAdminKpiValue,
  getAdminKpisForSchool
} from "@/lib/services/admin-kpis";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const schoolId = await getAdminSchoolId();

  let kpiItems = [
    { label: "Grupos activos", value: "0" },
    { label: "Evidencias por revisar", value: "0" },
    { label: "Kg separados", value: "0" },
    { label: "Puntos acumulados", value: "0" }
  ];

  if (schoolId) {
    try {
      const kpis = await getAdminKpisForSchool(schoolId);
      kpiItems = [
        { label: "Grupos activos", value: formatAdminKpiValue(kpis.activeGroups) },
        {
          label: "Evidencias por revisar",
          value: formatAdminKpiValue(kpis.pendingEvidence)
        },
        {
          label: "Kg separados",
          value: formatAdminKpiValue(kpis.totalKgSeparated, 1)
        },
        {
          label: "Puntos acumulados",
          value: formatAdminKpiValue(kpis.totalPoints)
        }
      ];
    } catch {
      // Si falla la consulta, se muestran ceros en lugar de romper el dashboard.
    }
  }

  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700">Dashboard administrativo</h1>
        <KpiTiles items={kpiItems} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/admin/usuarios" className="rounded-xl border bg-white p-4">
            Usuarios (maestros, grupos, jurado)
          </Link>
          <Link href="/dashboard/admin/semanas" className="rounded-xl border bg-white p-4">
            Activacion semanal
          </Link>
          <Link href="/dashboard/admin/evidencias" className="rounded-xl border bg-white p-4">
            Revisar evidencias
          </Link>
          <Link href="/dashboard/admin/experimentos" className="rounded-xl border bg-white p-4">
            Configurar experimentos
          </Link>
          <Link href="/dashboard/admin/ranking" className="rounded-xl border bg-white p-4">
            Ranking y filtros
          </Link>
          <Link href="/dashboard/admin/reportes" className="rounded-xl border bg-white p-4">
            Reportes y exportacion
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
