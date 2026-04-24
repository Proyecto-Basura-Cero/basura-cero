export type Role = "admin" | "teacher" | "group" | "jury";

export type Experiment = {
  id: string;
  weekNumber: number;
  title: string;
  objective: string;
  instructions: string;
  materials: string;
  printableUrl: string;
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
