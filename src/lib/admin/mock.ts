import { AdminEvidenceRow, AdminKpi, AdminReportRow } from "@/lib/admin/types";

export const adminKpis: AdminKpi[] = [
  { label: "Grupos activos", value: 24, trend: "+2" },
  { label: "Evidencias pendientes", value: 12, trend: "-1" },
  { label: "Kg separados", value: 312, trend: "+18" },
  { label: "Participantes", value: 734, trend: "+27" }
];

export const adminEvidenceRows: AdminEvidenceRow[] = [
  { id: "SUB-1001", groupName: "5A", weekNumber: 12, submittedAt: "2026-04-21", status: "submitted" },
  { id: "SUB-1002", groupName: "4B", weekNumber: 12, submittedAt: "2026-04-21", status: "submitted" },
  { id: "SUB-1003", groupName: "6C", weekNumber: 12, submittedAt: "2026-04-20", status: "approved" }
];

export const adminReportRows: AdminReportRow[] = [
  { group: "5A", grade: "5to", rank: 1, points: 860, completedWeeks: 8, kgSeparated: 78, participants: 32 },
  { group: "4B", grade: "4to", rank: 2, points: 810, completedWeeks: 7, kgSeparated: 70, participants: 29 },
  { group: "6C", grade: "6to", rank: 3, points: 790, completedWeeks: 7, kgSeparated: 69, participants: 31 }
];
