import { rankingData } from "@/lib/mock-data";

export function RankingPodium() {
  const top3 = rankingData.slice(0, 3);
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {top3.map((item, index) => (
        <article key={item.groupName} className="rounded-2xl border border-amber-200 bg-white p-4 text-center">
          <p className="text-sm text-slate-500">#{index + 1}</p>
          <h3 className="text-xl font-bold text-emerald-700">Grupo {item.groupName}</h3>
          <p className="text-sm text-slate-700">{item.points} pts</p>
        </article>
      ))}
    </section>
  );
}
