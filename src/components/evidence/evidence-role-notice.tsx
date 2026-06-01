import Link from "next/link";
import type { Route } from "next";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  admin: "administrador",
  teacher: "maestro",
  group: "grupo",
  jury: "jurado"
};

type Props = {
  role: Role;
};

export function EvidenceRoleNotice({ role }: Props) {
  const dashboardHref: Route =
    role === "jury" ? "/jurado" : role === "admin" ? "/dashboard/admin" : "/";

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-bold text-slate-800">Subir evidencia semanal</h3>
      <p className="mt-2 text-sm text-slate-600">
        Tu cuenta esta registrada como {ROLE_LABEL[role]}. Solo los maestros pueden
        enviar evidencias de sus grupos.
      </p>
      <Link
        href={dashboardHref}
        className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
      >
        Ir a tu panel
      </Link>
    </section>
  );
}
