import { RoleGuard } from "@/components/auth/role-guard";
import { ExperimentsManager } from "@/components/admin/experiments-manager";

export const dynamic = "force-dynamic";

export default function AdminExperimentsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-emerald-700">
            Configuracion de experimentos
          </h1>
          <p className="text-sm text-slate-600">
            Edita titulo, objetivo, materiales, instrucciones, video, dato
            curioso, conclusion, materiales y ficha PDF. Solo los experimentos
            publicados aparecen en la biblioteca publica.
          </p>
        </header>
        <ExperimentsManager />
      </div>
    </RoleGuard>
  );
}
