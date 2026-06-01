import { RoleGuard } from "@/components/auth/role-guard";
import { UsuariosManager } from "@/components/admin/usuarios-manager";

export const dynamic = "force-dynamic";

export default function AdminUsuariosPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-emerald-700">
            Gestion de usuarios
          </h1>
          <p className="text-sm text-slate-600">
            Crea y administra maestros, grupos y miembros del jurado para tu
            escuela.
          </p>
        </header>
        <UsuariosManager />
      </div>
    </RoleGuard>
  );
}
