import { Badge, Experiment, GroupScore } from "@/lib/types";

export const experiments: Experiment[] = Array.from({ length: 52 }, (_, index) => {
  const weekNumber = index + 1;
  return {
    id: `exp-${weekNumber}`,
    weekNumber,
    title: `Experimento ${weekNumber}`,
    objective: "Separar residuos y reducir basura en el aula.",
    instructions: "Separa residuos en estaciones, mide resultados y reflexiona en equipo.",
    materials: "Botes etiquetados, hojas de registro, guantes, etiquetas de colores.",
    printableUrl: `/fichas/semana-${weekNumber}.pdf`
  };
});

export const rankingData: GroupScore[] = [
  { groupName: "5A", grade: "5to", points: 860, badges: 6 },
  { groupName: "4B", grade: "4to", points: 810, badges: 5 },
  { groupName: "6C", grade: "6to", points: 790, badges: 5 },
  { groupName: "3A", grade: "3ro", points: 710, badges: 4 }
];

export const badgesData: Badge[] = [
  {
    code: "guardian_reciclaje",
    name: "Guardian del Reciclaje",
    description: "Completar 3 semanas con evidencia completa",
    unlocked: true
  },
  {
    code: "super_separador",
    name: "Super Separador",
    description: "Separar al menos 15kg de residuos",
    unlocked: true
  },
  {
    code: "heroe_cero_basura",
    name: "Heroe Cero Basura",
    description: "Mantener 8 semanas activas consecutivas",
    unlocked: false
  },
  {
    code: "grupo_eco_lider",
    name: "Grupo Eco-Lider",
    description: "Lograr primer lugar trimestral",
    unlocked: false
  }
];
