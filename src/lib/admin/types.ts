export type AdminKpi = {
  label: string;
  value: number;
  trend?: string;
};

export type AdminEvidenceRow = {
  id: string;
  groupName: string;
  weekNumber: number;
  submittedAt: string;
  status: "submitted" | "approved" | "rejected";
};

export type AdminReportRow = {
  group: string;
  points: number;
  kgSeparated: number;
  participants: number;
};
