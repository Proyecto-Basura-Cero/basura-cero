import type { AdminReportRow } from "@/lib/admin/types";

export function ReportPreviewTable({ rows }: { rows: AdminReportRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
        Aun no hay datos de grupos para exportar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-emerald-100 text-emerald-700">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Grado</th>
            <th className="px-4 py-2">Puntos</th>
            <th className="px-4 py-2">Semanas</th>
            <th className="px-4 py-2">Kg</th>
            <th className="px-4 py-2">Participantes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.group}-${row.grade}`} className="border-t border-emerald-50">
              <td className="px-4 py-2">{row.rank}</td>
              <td className="px-4 py-2 font-semibold">{row.group}</td>
              <td className="px-4 py-2">{row.grade}</td>
              <td className="px-4 py-2">{row.points.toLocaleString("es-MX")}</td>
              <td className="px-4 py-2">{row.completedWeeks}</td>
              <td className="px-4 py-2">{row.kgSeparated.toFixed(1)}</td>
              <td className="px-4 py-2">{row.participants}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
