import Link from "next/link";
import { Leaf } from "lucide-react";
import { getStudentSession } from "@/lib/auth-student";

/**
 * Layout dedicado de la zona del alumno.
 *
 * No muestra la navegacion de adultos (MainNav); en su lugar presenta una
 * barra superior propia, grande y amigable para ninos de primaria. El
 * `SiteChrome` del layout raiz se encarga de omitir el MainNav bajo `/alumno/*`.
 */
export default async function StudentLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getStudentSession();

  return (
    <div className="flex min-h-screen flex-col bg-eco-50">
      <header className="sticky top-0 z-10 border-b-4 border-eco-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-eco-100">
            <Leaf className="h-6 w-6 text-eco-600" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-eco-700">Basura Cero</p>
            <p className="text-xs font-semibold text-eco-500">Mi reto de la semana</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10">{children}</main>

      {!session && (
        <footer className="mx-auto w-full max-w-2xl px-4 pb-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-eco-600 underline hover:text-eco-700"
          >
            Volver al inicio
          </Link>
        </footer>
      )}
    </div>
  );
}
