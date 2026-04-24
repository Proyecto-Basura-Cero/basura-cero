export type ScoreWeights = {
  experimentCompleted: number;
  evidenceComplete: number;
  participationMax: number;
  wasteReductionMax: number;
  reusedItemsMax: number;
  creativityMax: number;
  teamworkMax: number;
};

export const defaultScoreWeights: ScoreWeights = {
  experimentCompleted: 25,
  evidenceComplete: 20,
  participationMax: 15,
  wasteReductionMax: 15,
  reusedItemsMax: 10,
  creativityMax: 10,
  teamworkMax: 5
};

export type BadgeRuleCode =
  | "guardian_reciclaje"
  | "super_separador"
  | "heroe_cero_basura"
  | "equipo_compostero"
  | "aula_verde"
  | "reto_cumplido"
  | "impacto_dorado"
  | "grupo_eco_lider";

export type BadgeRule = {
  code: BadgeRuleCode;
  label: string;
  description: string;
  evaluate: (input: BadgeEvaluationInput) => boolean;
};

export type BadgeEvaluationInput = {
  totalKgSeparated: number;
  completedWeeks: number;
  consecutiveWeeks: number;
  compostWeeks: number;
  avgParticipation: number;
  onTimeSubmissions: number;
  isTop3Monthly: boolean;
  isTop1Quarterly: boolean;
};

export const badgeRules: BadgeRule[] = [
  {
    code: "guardian_reciclaje",
    label: "Guardian del Reciclaje",
    description: "3 semanas con evidencia completa",
    evaluate: (input) => input.completedWeeks >= 3
  },
  {
    code: "super_separador",
    label: "Super Separador",
    description: "15kg acumulados separados",
    evaluate: (input) => input.totalKgSeparated >= 15
  },
  {
    code: "heroe_cero_basura",
    label: "Heroe Cero Basura",
    description: "8 semanas consecutivas activas",
    evaluate: (input) => input.consecutiveWeeks >= 8
  },
  {
    code: "equipo_compostero",
    label: "Equipo Compostero",
    description: "5 retos de compostaje completados",
    evaluate: (input) => input.compostWeeks >= 5
  },
  {
    code: "aula_verde",
    label: "Aula Verde",
    description: "Participacion promedio >= 85%",
    evaluate: (input) => input.avgParticipation >= 85
  },
  {
    code: "reto_cumplido",
    label: "Reto Cumplido",
    description: "Entrega semanal en tiempo",
    evaluate: (input) => input.onTimeSubmissions >= 1
  },
  {
    code: "impacto_dorado",
    label: "Impacto Dorado",
    description: "Top 3 mensual",
    evaluate: (input) => input.isTop3Monthly
  },
  {
    code: "grupo_eco_lider",
    label: "Grupo Eco-Lider",
    description: "Top 1 trimestral",
    evaluate: (input) => input.isTop1Quarterly
  }
];
