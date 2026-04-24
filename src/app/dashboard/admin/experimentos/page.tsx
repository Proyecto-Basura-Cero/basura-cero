import { RoleGuard } from "@/components/auth/role-guard";
import { experiments } from "@/lib/mock-data";

export default async function AdminExperimentsPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-emerald-700">Configuracion de experimentos</h1>
        <div className="rounded-2xl border bg-white p-4 text-sm">
          <p className="mb-3 text-slate-600">CRUD base listo para conectar con Supabase.</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {experiments.slice(0, 12).map((exp) => (
              <li key={exp.id} className="rounded border p-2">
                Semana {exp.weekNumber}: {exp.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RoleGuard>
  );
}
