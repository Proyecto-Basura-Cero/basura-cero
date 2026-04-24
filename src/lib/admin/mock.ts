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
  { group: "5A", points: 860, kgSeparated: 78, participants: 32 },
  { group: "4B", points: 810, kgSeparated: 70, participants: 29 },
  { group: "6C", points: 790, kgSeparated: 69, participants: 31 }
];
