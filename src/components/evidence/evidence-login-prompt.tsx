import Link from "next/link";
import type { Route } from "next";

type Props = {
  returnPath: string;
};

export function EvidenceLoginPrompt({ returnPath }: Props) {
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}` as Route;

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h3 className="text-lg font-bold text-emerald-700">Subir evidencia semanal</h3>
      <p className="mt-2 text-sm text-slate-600">
        Para registrar fotos, metricas y comentarios del grupo necesitas iniciar
        sesion como maestro o administrador.
      </p>
      <Link
        href={loginHref}
        className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Iniciar sesion
      </Link>
    </section>
  );
}
