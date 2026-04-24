import { RoleGuard } from "@/components/auth/role-guard";
import { ImpactCharts } from "@/components/metrics/impact-charts";

export default async function AdminReportsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-emerald-700">Reportes de impacto</h1>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/admin/export?format=csv"
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Exportar CSV
          </a>
          <a
            href="/api/admin/export?format=pdf"
            className="inline-flex rounded-xl border border-emerald-600 px-4 py-2 font-semibold text-emerald-700"
          >
            Exportar plantilla PDF
          </a>
        </div>
        <ImpactCharts />
      </div>
    </RoleGuard>
  );
}
