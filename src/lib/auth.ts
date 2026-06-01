import { cookies } from "next/headers";
import { Role } from "@/lib/types";

const VALID_ROLES: Role[] = ["admin", "teacher", "group", "jury"];

export type Session = {
  role: Role;
  userId: string;
  schoolId: string | null;
};

export async function getRoleFromSession(): Promise<Role | null> {
  const session = await getSession();
  return session?.role ?? null;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value as Role | undefined;
  const userId = cookieStore.get("userId")?.value;
  if (!role || !userId) return null;
  if (!VALID_ROLES.includes(role)) return null;
  const schoolId = cookieStore.get("schoolId")?.value ?? null;
  return { role, userId, schoolId };
}
