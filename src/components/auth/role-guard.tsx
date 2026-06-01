import { redirect } from "next/navigation";
import { getRoleFromSession, mustChangePasswordFromSession } from "@/lib/auth";
import { Role } from "@/lib/types";

export async function RoleGuard({
  allow,
  children
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const role = await getRoleFromSession();
  if (!role) {
    redirect("/login");
  }
  if (await mustChangePasswordFromSession()) {
    redirect("/cuenta/cambiar-contrasena");
  }
  if (!allow.includes(role)) {
    redirect("/");
  }
  return <>{children}</>;
}
