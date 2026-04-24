import Link from "next/link";
import { RoleGuard } from "@/components/auth/role-guard";
import { KpiTiles } from "@/components/metrics/kpi-tiles";

export default async function AdminDashboardPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-700">Dashboard administrativo</h1>
        <KpiTiles
          items={[
            { label: "Grupos activos", value: "24" },
            { label: "Evidencias por revisar", value: "12" },
            { label: "Kg separados", value: "312" },
            { label: "Puntos acumulados", value: "4,880" }
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
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
