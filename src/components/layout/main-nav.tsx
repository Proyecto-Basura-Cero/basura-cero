import Link from "next/link";
import type { Route } from "next";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Inicio" },
  { href: "/semana-actual", label: "Semana actual" },
  { href: "/experimentos", label: "Experimentos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/insignias", label: "Insignias" },
  { href: "/jurado", label: "Jurado" },
  { href: "/login", label: "Acceder" }
];

export function MainNav() {
  return (
    <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm font-medium">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
