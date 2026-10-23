"use client";

import { usePathname } from "next/navigation";

/**
 * Decide el "chrome" (navegacion + contenedor) segun la ruta.
 *
 * La zona del alumno (`/alumno/*`) tiene su propio layout infantil
 * (barra superior propia, sin la navegacion de adultos), por lo que aqui
 * omitimos el MainNav y el contenedor acotado y dejamos que
 * `src/app/alumno/layout.tsx` controle toda la pantalla.
 */
export function SiteChrome({
  nav,
  children
}: {
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudentArea = pathname?.startsWith("/alumno") ?? false;

  if (isStudentArea) {
    return <>{children}</>;
  }

  return (
    <>
      {nav}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
