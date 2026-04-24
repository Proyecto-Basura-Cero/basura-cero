import { NextRequest, NextResponse } from "next/server";
import { adminReportRows } from "@/lib/admin/mock";
import { toCsv, toSimplePdfHtml } from "@/lib/admin/export";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "csv";

  if (format === "csv") {
    const csv = toCsv(adminReportRows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=impact-report.csv"
      }
    });
  }

  if (format === "pdf") {
    const html = toSimplePdfHtml(adminReportRows);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": "attachment; filename=impact-report.html"
      }
    });
  }

  return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
}
