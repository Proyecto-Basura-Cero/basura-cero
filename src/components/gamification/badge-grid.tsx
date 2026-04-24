import { badgesData } from "@/lib/mock-data";

export function BadgeGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badgesData.map((badge) => (
        <article
          key={badge.code}
          className={`rounded-2xl border p-4 ${
            badge.unlocked ? "border-emerald-300 bg-white" : "border-slate-200 bg-slate-50"
          }`}
        >
          <h3 className="font-bold text-emerald-700">{badge.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
            {badge.unlocked ? "Desbloqueada" : "Pendiente"}
          </p>
        </article>
      ))}
    </section>
  );
}
