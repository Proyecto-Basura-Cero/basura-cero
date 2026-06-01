"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

const schema = z
  .object({
    newPassword: z.string().min(8, "Minimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma la contrasena")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

const ROLE_REDIRECT: Record<Role, Route> = {
  admin: "/dashboard/admin",
  teacher: "/dashboard/maestro",
  group: "/dashboard/maestro",
  jury: "/jurado"
};

export function ChangePasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    const accessToken = sessionData.session?.access_token;
    if (sessionError || !accessToken) {
      setServerError(
        "Tu sesion expiro. Vuelve a iniciar sesion con la contrasena temporal."
      );
      return;
    }

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      role?: Role;
    };

    if (!response.ok) {
      setServerError(payload.error ?? "No se pudo actualizar la contrasena");
      return;
    }

    const destination: Route =
      payload.role && ROLE_REDIRECT[payload.role]
        ? ROLE_REDIRECT[payload.role]
        : "/";
    router.replace(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Por seguridad debes elegir una contrasena personal antes de continuar.
        No uses la contrasena temporal que te entrego el administrador.
      </p>

      <div className="space-y-1">
        <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
          Nueva contrasena
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-xs text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700"
        >
          Confirmar contrasena
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar y continuar"}
      </button>
    </form>
  );
}
