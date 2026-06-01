import type { RankingEntry } from "@/lib/services/group-ranking";

type Props = {
  rows: RankingEntry[];
  showRank?: boolean;
};

export function LeaderboardTable({ rows, showRank = true }: Props) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-slate-500">
        Aun no hay grupos con puntaje registrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-emerald-100 text-emerald-700">
          <tr>
            {showRank && <th className="px-4 py-2">#</th>}
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Grado</th>
            <th className="px-4 py-2">Puntos</th>
            <th className="px-4 py-2">Semanas</th>
            <th className="px-4 py-2">Insignias</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.groupId} className="border-t border-emerald-50">
              {showRank && (
                <td className="px-4 py-2 font-semibold text-slate-500">
                  {row.schoolRank}
                </td>
              )}
              <td className="px-4 py-2 font-semibold">{row.groupName}</td>
              <td className="px-4 py-2">{row.grade}</td>
              <td className="px-4 py-2">{row.points.toLocaleString("es-MX")}</td>
              <td className="px-4 py-2">{row.completedWeeks}</td>
              <td className="px-4 py-2">{row.badges}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
