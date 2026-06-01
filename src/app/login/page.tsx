import { LoginForm } from "./login-form";

export const metadata = {
  title: "Ingreso | Basura Cero"
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-emerald-700">Iniciar sesion</h1>
      <p className="mt-2 text-sm text-slate-600">
        Usa el correo registrado en Supabase. Tu rol (admin, maestro, grupo o jurado) se
        detecta automaticamente.
      </p>
      <LoginForm />
    </section>
  );
}
