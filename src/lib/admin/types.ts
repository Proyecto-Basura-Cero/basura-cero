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
  grade: string;
  rank: number;
  points: number;
  completedWeeks: number;
  kgSeparated: number;
  reusedItems: number;
  participants: number;
};
