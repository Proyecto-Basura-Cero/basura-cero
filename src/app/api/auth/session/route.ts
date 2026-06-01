import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const COOKIE_MAX_AGE = 60 * 60 * 8;
const ALLOWED_ROLES: Role[] = ["admin", "teacher", "group", "jury"];

export async function POST(request: Request) {
  let body: { accessToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const accessToken = body.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Falta accessToken" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, school_id, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json(
      {
        error:
          "El usuario existe en Supabase Auth pero no esta dado de alta en la tabla users. Crea el registro con su role y school_id."
      },
      { status: 403 }
    );
  }

  if (profile.is_active === false) {
    return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
  }

  if (!ALLOWED_ROLES.includes(profile.role as Role)) {
    return NextResponse.json({ error: "Rol no permitido" }, { status: 403 });
  }

  const cookieStore = await cookies();
  const baseOptions = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  };

  cookieStore.set("role", profile.role, baseOptions);
  cookieStore.set("userId", userData.user.id, baseOptions);
  if (profile.school_id) {
    cookieStore.set("schoolId", profile.school_id, baseOptions);
  } else {
    cookieStore.delete("schoolId");
  }

  return NextResponse.json({
    role: profile.role as Role,
    schoolId: profile.school_id ?? null,
    userId: userData.user.id
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("role");
  cookieStore.delete("userId");
  cookieStore.delete("schoolId");
  return NextResponse.json({ ok: true });
}
