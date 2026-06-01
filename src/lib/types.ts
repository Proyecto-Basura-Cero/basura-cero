export type Role = "admin" | "teacher" | "group" | "jury";

export type Experiment = {
  id: string;
  weekNumber: number;
  title: string;
  objective: string;
  instructions: string;
  materials: string | null;
  printableUrl: string | null;
  videoUrl: string | null;
  curiousFact: string;
  conclusion: string;
  status: "draft" | "published" | "archived";
};

export type GroupScore = {
  groupName: string;
  grade: string;
  points: number;
  badges: number;
};

export type Badge = {
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
};
