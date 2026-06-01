import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const COOKIE_MAX_AGE = 60 * 60 * 8;

const schema = z
  .object({
    accessToken: z.string().min(1),
    newPassword: z.string().min(8, "Minimo 8 caracteres"),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"]
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Datos invalidos" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser(
    parsed.data.accessToken
  );

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  const userId = userData.user.id;

  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get("userId")?.value;
  if (!cookieUserId || cookieUserId !== userId) {
    return NextResponse.json(
      { error: "La sesion no coincide con el usuario" },
      { status: 403 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, is_active, must_change_password")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  if (!profile || profile.is_active === false) {
    return NextResponse.json({ error: "Usuario no valido" }, { status: 403 });
  }
  if (profile.must_change_password !== true) {
    return NextResponse.json(
      { error: "No se requiere cambio de contrasena" },
      { status: 400 }
    );
  }

  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
    userId,
    { password: parsed.data.newPassword }
  );
  if (updateAuthError) {
    return NextResponse.json({ error: updateAuthError.message }, { status: 400 });
  }

  const { error: updateProfileError } = await supabase
    .from("users")
    .update({ must_change_password: false, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (updateProfileError) {
    return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
  }

  const baseOptions = {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  };
  cookieStore.delete("mustChangePassword");

  return NextResponse.json({
    ok: true,
    role: profile.role as Role
  });
}
