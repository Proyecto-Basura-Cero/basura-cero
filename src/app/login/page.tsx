import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6">
      <h1 className="text-2xl font-bold text-emerald-700">Ingreso docente</h1>
      <p className="mt-2 text-sm text-slate-600">En MVP se simula autenticacion por cookie de rol.</p>
      <div className="mt-4 space-y-2 text-sm">
        <Link href="/dashboard/maestro" className="block rounded bg-emerald-600 px-3 py-2 text-white">
          Entrar como maestro
        </Link>
        <Link href="/dashboard/admin" className="block rounded bg-sky-600 px-3 py-2 text-white">
          Entrar como admin
        </Link>
        <Link href="/jurado" className="block rounded bg-amber-500 px-3 py-2 text-slate-900">
          Entrar como jurado
        </Link>
      </div>
    </section>
  );
}
