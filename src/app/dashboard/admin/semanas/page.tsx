import { RoleGuard } from "@/components/auth/role-guard";
import { SemanasManager } from "@/components/admin/semanas-manager";

export const dynamic = "force-dynamic";

export default function AdminSemanasPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-emerald-700">
            Activacion semanal
          </h1>
          <p className="text-sm text-slate-600">
            Programa los retos de tu escuela y marca cual esta activo esta semana.
            Los maestros veran el reto activo en su panel.
          </p>
        </header>
        <SemanasManager />
      </div>
    </RoleGuard>
  );
}
