import { AdminReportRow } from "@/lib/admin/types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: AdminReportRow[]): string {
  const header = [
    "rank",
    "group",
    "grade",
    "points",
    "completed_weeks",
    "kg_separated",
    "participants"
  ];
  const body = rows.map((row) => [
    row.rank,
    row.group,
    row.grade,
    row.points,
    row.completedWeeks,
    row.kgSeparated,
    row.participants
  ]);
  return [header, ...body]
    .map((line) => line.map(escapeCsv).join(","))
    .join("\n");
}

export function toSimplePdfHtml(
  rows: AdminReportRow[],
  options?: { schoolName?: string; generatedAt?: string }
): string {
  const trs = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.rank}</td>
          <td>${row.group}</td>
          <td>${row.grade}</td>
          <td>${row.points}</td>
          <td>${row.completedWeeks}</td>
          <td>${row.kgSeparated.toFixed(1)}</td>
          <td>${row.participants}</td>
        </tr>`
    )
    .join("");

  const schoolLine = options?.schoolName
    ? `<p><strong>Escuela:</strong> ${options.schoolName}</p>`
    : "";
  const dateLine = options?.generatedAt
    ? `<p><strong>Generado:</strong> ${options.generatedAt}</p>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reporte Basura Cero</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
      h1 { color: #047857; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 14px; }
      th { background: #ecfdf5; }
    </style>
  </head>
  <body>
    <h1>Reporte de Impacto Basura Cero</h1>
    ${schoolLine}
    ${dateLine}
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Grupo</th>
          <th>Grado</th>
          <th>Puntos</th>
          <th>Semanas</th>
          <th>Kg separados</th>
          <th>Participantes</th>
        </tr>
      </thead>
      <tbody>${trs || "<tr><td colspan='7'>Sin datos</td></tr>"}</tbody>
    </table>
  </body>
</html>`;
}
