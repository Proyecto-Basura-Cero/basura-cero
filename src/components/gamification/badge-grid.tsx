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
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-slate-500">
        {emptyMessage}
      </section>
    );
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section className="space-y-3">
      <p className="text-sm text-slate-600">
        {unlockedCount} de {badges.length} insignia(s) desbloqueada(s) en tus
        grupos.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <article
            key={badge.code}
            className={`rounded-2xl border p-4 ${
              badge.unlocked
                ? "border-emerald-300 bg-white"
                : "border-slate-200 bg-slate-50 opacity-80"
            }`}
          >
            <h3 className="font-bold text-emerald-700">{badge.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
              {badge.unlocked ? "Desbloqueada" : "Pendiente"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
