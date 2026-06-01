import { redirect } from "next/navigation";
import { getSession, mustChangePasswordFromSession } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const mustChange = await mustChangePasswordFromSession();
  if (!mustChange) {
    const destinations = {
      admin: "/dashboard/admin",
      teacher: "/dashboard/maestro",
      group: "/dashboard/maestro",
      jury: "/jurado"
    } as const;
    redirect(destinations[session.role] ?? "/");
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-emerald-700">Cambiar contrasena</h1>
      <p className="mt-2 text-sm text-slate-600">
        Es tu primer ingreso. Elige una contrasena segura que solo tu conozcas.
      </p>
      <ChangePasswordForm />
    </section>
  );
}
