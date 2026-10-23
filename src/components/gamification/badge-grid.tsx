import { Award, Lock } from "lucide-react";
import type { Badge } from "@/lib/types";

type Props = {
  badges: Badge[];
  emptyMessage?: string;
};

export function BadgeGrid({
  badges,
  emptyMessage = "Aun no hay insignias configuradas."
}: Props) {
  if (!badges.length) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-slate-600">
        {emptyMessage}
      </section>
    );
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">
        {unlockedCount} de {badges.length} insignia(s) desbloqueada(s) en tus
        grupos.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <article
            key={badge.code}
            className={`flex flex-col items-center rounded-2xl border-4 p-4 text-center transition ${
              badge.unlocked
                ? "border-sun-300 bg-white"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            {/* medalla */}
            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                badge.unlocked
                  ? "bg-gradient-to-b from-sun-300 to-sun-500 shadow-sm"
                  : "bg-slate-200"
              }`}
            >
              <Award
                className={`h-10 w-10 ${
                  badge.unlocked ? "text-white" : "text-slate-400"
                }`}
                aria-hidden
              />
              {!badge.unlocked && (
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-400">
                  <Lock className="h-3.5 w-3.5 text-white" aria-hidden />
                </span>
              )}
            </div>

            <h3
              className={`mt-3 font-display text-base font-bold ${
                badge.unlocked ? "text-eco-700" : "text-slate-500"
              }`}
            >
              {badge.name}
            </h3>
            <p
              className={`mt-1 text-sm ${
                badge.unlocked ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {badge.description}
            </p>
            <p
              className={`mt-2 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${
                badge.unlocked
                  ? "bg-eco-100 text-eco-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {badge.unlocked ? "Desbloqueada" : "Pendiente"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
