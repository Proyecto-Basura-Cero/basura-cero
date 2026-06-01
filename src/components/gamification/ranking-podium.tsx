import type { RankingEntry } from "@/lib/services/group-ranking";

const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_LABELS = ["Oro", "Plata", "Bronce"] as const;

type Props = {
  rows: RankingEntry[];
};

export function RankingPodium({ rows }: Props) {
  const top3 = rows.slice(0, 3);

  if (!top3.length) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        El podio se mostrara cuando haya grupos con puntaje.
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {PODIUM_ORDER.map((index) => {
        const item = top3[index];
        if (!item) {
          return (
            <article
              key={`empty-${index}`}
              className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center opacity-60"
            >
              <p className="text-sm text-slate-400">#{index + 1}</p>
              <p className="mt-2 text-sm text-slate-500">Pendiente</p>
            </article>
          );
        }
        return (
          <article
            key={item.groupId}
            className={`rounded-2xl border p-4 text-center ${
              index === 0
                ? "border-amber-300 bg-amber-50 md:order-2 md:-mt-2"
                : index === 1
                  ? "border-slate-300 bg-white md:order-1"
                  : "border-orange-200 bg-orange-50 md:order-3"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              #{item.schoolRank} - {PODIUM_LABELS[index]}
            </p>
            <h3 className="mt-1 text-xl font-bold text-emerald-700">
              Grupo {item.groupName}
            </h3>
            <p className="text-sm text-slate-700">
              {item.points.toLocaleString("es-MX")} pts
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {item.badges} insignia(s) - {item.completedWeeks} semana(s)
            </p>
          </article>
        );
      })}
    </section>
  );
}
