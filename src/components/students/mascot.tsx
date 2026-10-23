import { useId, type CSSProperties } from "react";

/**
 * Mascota de la zona del alumno: "Territa", el planeta Tierra con cara.
 * Es SVG inline (sin dependencias ni assets externos) y acompana
 * emocionalmente al nino en cada pantalla, al estilo de Duolingo.
 *
 * Estados (mood):
 * - "hola":    saludo, pose neutra-amable (pantalla de acceso)
 * - "animo":   anima a seguir (pasos pendientes)
 * - "celebra": festejo con brazos arriba (exito de reto/juego/evidencia)
 * - "ups":     gesto amable de "vuelve a intentarlo" (error, no punitivo)
 */

export type MascotMood = "hola" | "animo" | "celebra" | "ups";

type MascotProps = {
  mood?: MascotMood;
  /** Tamano en px del lado del SVG. */
  size?: number;
  className?: string;
  style?: CSSProperties;
};

const MOUTH_BY_MOOD: Record<MascotMood, string> = {
  hola: "M40 66 q12 9 24 0",
  animo: "M40 64 q12 13 24 0",
  celebra: "M38 62 q14 17 28 0",
  ups: "M44 66 q8 4 16 0"
};

export function Mascot({ mood = "hola", size = 96, className, style }: MascotProps) {
  // id unico por instancia: el componente se renderiza varias veces en una
  // misma pagina y cada clipPath necesita un id propio para no colisionar.
  const clipId = `mascot-globe-${useId().replace(/:/g, "")}`;
  const isCelebrating = mood === "celebra";
  const isUps = mood === "ups";

  // Animacion segun el estado emocional (se respeta prefers-reduced-motion
  // via regla global en globals.css).
  const animationClass = isCelebrating
    ? "animate-wiggle"
    : isUps
      ? "animate-shake"
      : "animate-pop";

  return (
    <span
      className={`inline-block ${animationClass} ${className ?? ""}`}
      style={{ transformOrigin: "center bottom" }}
    >
    <svg
      role="img"
      aria-label="Territa, el planeta que cuida contigo"
      width={size}
      height={size}
      viewBox="0 0 104 112"
      style={style}
    >
      {/* bracitos: arriba si celebra, a los lados si no */}
      {isCelebrating ? (
        <>
          <path d="M14 48 q-8 -14 2 -24" stroke="#1f8a4e" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M90 48 q8 -14 -2 -24" stroke="#1f8a4e" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M12 60 q-10 4 -12 16" stroke="#1f8a4e" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M92 60 q10 4 12 16" stroke="#1f8a4e" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* oceano */}
      <circle cx="52" cy="56" r="44" fill="#38bdf8" />
      <circle cx="52" cy="56" r="44" fill="#0ea5e9" opacity="0.12" />

      {/* continentes recortados al circulo del planeta */}
      <clipPath id={clipId}>
        <circle cx="52" cy="56" r="44" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {/* Norteamerica */}
        <path d="M14 30 q12 -6 20 0 q6 8 -2 14 q4 8 -6 12 q-10 -2 -10 -12 q-8 -6 -2 -14z" fill="#4cc07e" />
        {/* Sudamerica */}
        <path d="M30 70 q10 -4 14 6 q0 14 -8 22 q-10 -4 -9 -16 q-2 -8 3 -12z" fill="#2a9d5b" />
        {/* Europa/Africa */}
        <path d="M58 34 q12 -4 18 4 q-2 10 -10 10 q2 12 -6 20 q-10 -6 -6 -18 q-4 -10 10 -16z" fill="#4cc07e" />
        {/* Asia */}
        <path d="M78 40 q8 -2 10 6 q-6 6 -12 2 q-2 -6 2 -8z" fill="#2a9d5b" />
        {/* islas/Oceania */}
        <circle cx="82" cy="74" r="5" fill="#4cc07e" />
        <circle cx="40" cy="84" r="4" fill="#4cc07e" />
      </g>

      {/* mejillas */}
      <circle cx="28" cy="62" r="6" fill="#ff8a8a" opacity="0.6" />
      <circle cx="76" cy="62" r="6" fill="#ff8a8a" opacity="0.6" />

      {/* ojos */}
      {isUps ? (
        <>
          <path d="M34 50 q6 -6 12 0" stroke="#14402a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M58 50 q6 -6 12 0" stroke="#14402a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="50" r="7" fill="#ffffff" />
          <circle cx="42" cy="52" r="3.5" fill="#14402a" />
          <circle cx="64" cy="50" r="7" fill="#ffffff" />
          <circle cx="66" cy="52" r="3.5" fill="#14402a" />
        </>
      )}

      {/* boca */}
      <path
        d={MOUTH_BY_MOOD[mood]}
        stroke="#14402a"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
    </span>
  );
}
