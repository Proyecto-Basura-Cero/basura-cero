import { RoleGuard } from "@/components/auth/role-guard";
import { ReportPreviewTable } from "@/components/admin/report-preview-table";
import { ImpactCharts } from "@/components/metrics/impact-charts";
import { KpiTiles } from "@/components/metrics/kpi-tiles";
import { getAdminSchoolId } from "@/lib/auth-admin";
import { formatAdminKpiValue } from "@/lib/services/admin-kpis";
import {
  getAdminReportRows,
  getSchoolReportSummary,
  getWeeklyImpactChart
} from "@/lib/services/admin-reports";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const schoolId = await getAdminSchoolId();

  let rows: Awaited<ReturnType<typeof getAdminReportRows>> = [];
  let weekly: Awaited<ReturnType<typeof getWeeklyImpactChart>> = [];
  let summary: Awaited<ReturnType<typeof getSchoolReportSummary>> = null;

  if (schoolId) {
    try {
      [rows, weekly, summary] = await Promise.all([
        getAdminReportRows(schoolId),
        getWeeklyImpactChart(schoolId),
        getSchoolReportSummary(schoolId)
      ]);
    } catch {
      rows = [];
      weekly = [];
      summary = null;
    }
  }

  const kpiItems = summary
    ? [
        {
          label: "Kg separados (total)",
          value: formatAdminKpiValue(summary.totalKgSeparated, 1)
        },
        {
          label: "Materiales reutilizados",
          value: formatAdminKpiValue(summary.totalReusedItems)
        },
        {
          label: "Participantes",
          value: formatAdminKpiValue(summary.totalParticipants)
        },
        {
          label: "Evidencias registradas",
          value: formatAdminKpiValue(summary.totalSubmissions)
        }
      ]
    : [
        { label: "Kg separados (total)", value: "0" },
        { label: "Materiales reutilizados", value: "0" },
        { label: "Participantes", value: "0" },
        { label: "Evidencias registradas", value: "0" }
      ];

  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-emerald-700">Reportes de impacto</h1>
          {summary?.schoolName && (
            <p className="text-sm text-slate-600">{summary.schoolName}</p>
          )}
        </header>

        <KpiTiles items={kpiItems} />

        <div className="flex flex-wrap gap-3">
          <a
            href="/api/admin/export?format=csv"
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Exportar CSV
          </a>
          <a
            href="/api/admin/export?format=pdf"
            className="inline-flex rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Exportar plantilla PDF
          </a>
        </div>

        <ImpactCharts data={weekly} />

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-emerald-700">
            Resumen por grupo
          </h2>
          <ReportPreviewTable rows={rows} />
        </section>
      </div>
    </RoleGuard>
  );
}
