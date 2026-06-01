import { NextRequest, NextResponse } from "next/server";
import { toCsv, toSimplePdfHtml } from "@/lib/admin/export";
import { jsonError, requireAdminWithSchool } from "@/lib/auth-admin";
import {
  getAdminReportRows,
  getSchoolReportSummary
} from "@/lib/services/admin-reports";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminWithSchool();
    const format = request.nextUrl.searchParams.get("format") ?? "csv";

    const [rows, summary] = await Promise.all([
      getAdminReportRows(session.schoolId),
      getSchoolReportSummary(session.schoolId)
    ]);

    const generatedAt = new Date().toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    if (format === "csv") {
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=reporte-impacto-basura-cero.csv"
        }
      });
    }

    if (format === "pdf") {
      const html = toSimplePdfHtml(rows, {
        schoolName: summary?.schoolName,
        generatedAt
      });
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "attachment; filename=reporte-impacto-basura-cero.html"
        }
      });
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
