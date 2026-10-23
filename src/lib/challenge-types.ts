/**
 * Tipos de reto (categoria de accion ecologica) y su presentacion visual.
 *
 * Fuente unica de verdad para etiquetas y colores del calendario de 52
 * semanas. El color NO se guarda en la base de datos: se deriva aqui del
 * tipo, usando la paleta de Tailwind (eco-*, sun, sky, grape).
 */

export const CHALLENGE_TYPES = [
  "reducir",
  "reutilizar",
  "reciclar",
  "reflexionar"
] as const;

export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export function isChallengeType(value: unknown): value is ChallengeType {
  return (
    typeof value === "string" &&
    (CHALLENGE_TYPES as readonly string[]).includes(value)
  );
}

type ChallengeTypeStyle = {
  label: string;
  /** Clases de fondo/texto para una celda "activa" (semana con este tipo). */
  cell: string;
  /** Clase de fondo solida para la leyenda (cuadrito de color). */
  swatch: string;
};

export const CHALLENGE_TYPE_STYLES: Record<ChallengeType, ChallengeTypeStyle> = {
  reducir: {
    label: "Reducir",
    cell: "bg-eco-400 text-eco-900",
    swatch: "bg-eco-400"
  },
  reutilizar: {
    label: "Reutilizar",
    cell: "bg-sky-400 text-sky-900",
    swatch: "bg-sky-400"
  },
  reciclar: {
    label: "Reciclar",
    cell: "bg-sun-400 text-sun-600",
    swatch: "bg-sun-400"
  },
  reflexionar: {
    label: "Reflexionar",
    cell: "bg-grape-400 text-grape-600",
    swatch: "bg-grape-400"
  }
};

/** Estilo para una celda sin tipo configurado todavia. */
export const UNTYPED_CELL = "bg-slate-200 text-slate-600";

export function challengeTypeLabel(type: ChallengeType | null): string {
  return type ? CHALLENGE_TYPE_STYLES[type].label : "Sin tipo";
}
