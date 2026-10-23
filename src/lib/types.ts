export type Role = "admin" | "teacher" | "group" | "jury";

import type { ChallengeType } from "@/lib/challenge-types";

export type Experiment = {
  id: string;
  weekNumber: number;
  title: string;
  objective: string;
  challengeType: ChallengeType | null;
  instructions: string;
  materials: string | null;
  printableUrl: string | null;
  videoUrl: string | null;
  hypothesis: string | null;
  classification: string | null;
  observations: string | null;
  resultsPrompt: string | null;
  drawingPrompt: string | null;
  finalMessage: string | null;
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
