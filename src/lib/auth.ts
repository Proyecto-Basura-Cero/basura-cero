import { cookies } from "next/headers";
import { Role } from "@/lib/types";

export async function getRoleFromSession(): Promise<Role | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value as Role | undefined;
  if (!role) return null;
  if (["admin", "teacher", "group", "jury"].includes(role)) {
    return role;
  }
  return null;
}
