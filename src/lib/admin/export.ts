import { AdminReportRow } from "@/lib/admin/types";

export function toCsv(rows: AdminReportRow[]): string {
  const header = ["group", "points", "kg_separated", "participants"];
  const body = rows.map((row) => [row.group, row.points, row.kgSeparated, row.participants]);
  return [header, ...body].map((line) => line.join(",")).join("\n");
}

export function toSimplePdfHtml(rows: AdminReportRow[]): string {
  const trs = rows
    .map(
      (row) =>
        `<tr><td>${row.group}</td><td>${row.points}</td><td>${row.kgSeparated}</td><td>${row.participants}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Reporte Basura Cero</title></head>
  <body>
    <h1>Reporte de Impacto Basura Cero</h1>
    <table border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>Grupo</th><th>Puntos</th><th>Kg</th><th>Participantes</th></tr></thead>
      <tbody>${trs}</tbody>
    </table>
  </body>
</html>`;
}
