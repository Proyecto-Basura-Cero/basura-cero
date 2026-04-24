import { rankingData } from "@/lib/mock-data";

export function LeaderboardTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-emerald-100 text-emerald-700">
          <tr>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Grado</th>
            <th className="px-4 py-2">Puntos</th>
            <th className="px-4 py-2">Insignias</th>
          </tr>
        </thead>
        <tbody>
          {rankingData.map((row) => (
            <tr key={row.groupName} className="border-t border-emerald-50">
              <td className="px-4 py-2 font-semibold">{row.groupName}</td>
              <td className="px-4 py-2">{row.grade}</td>
              <td className="px-4 py-2">{row.points}</td>
              <td className="px-4 py-2">{row.badges}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
