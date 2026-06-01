import { LoginForm } from "./login-form";

export const metadata = {
  title: "Ingreso | Basura Cero"
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-emerald-700">Iniciar sesion</h1>
      <p className="mt-2 text-sm text-slate-600">
        Usa el correo registrado en Supabase. Tu rol (admin, maestro, grupo o jurado) se
        detecta automaticamente.
      </p>
      <LoginForm nextPath={next} />
    </section>
  );
}
