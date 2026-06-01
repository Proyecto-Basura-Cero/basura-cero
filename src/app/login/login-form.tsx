"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabaseClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "Minimo 6 caracteres")
});

type FormValues = z.infer<typeof schema>;

const ROLE_REDIRECT: Record<Role, Route> = {
  admin: "/dashboard/admin",
  teacher: "/dashboard/maestro",
  group: "/dashboard/maestro",
  jury: "/jurado"
};

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error || !data.session) {
      setServerError(error?.message ?? "No se pudo iniciar sesion");
      return;
    }

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: data.session.access_token })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setServerError(payload.error ?? "No se pudo establecer la sesion");
      await supabaseClient.auth.signOut();
      return;
    }

    const payload = (await response.json()) as {
      role: Role;
      mustChangePassword?: boolean;
    };
    const destination: Route = payload.mustChangePassword
      ? "/cuenta/cambiar-contrasena"
      : ROLE_REDIRECT[payload.role] ?? "/";
    router.replace(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Correo
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
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
        {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
      </button>
    </form>
  );
}
