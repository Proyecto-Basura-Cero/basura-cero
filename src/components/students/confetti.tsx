"use client";

import { useMemo } from "react";

/**
 * Confeti ligero sin dependencias: piezas posicionadas en absoluto que caen
 * con la animacion `confetti-fall` (definida en tailwind.config.ts). Pensado
 * para celebrar un exito (evidencia enviada, juego completado).
 *
 * Es decorativo: aria-hidden y pointer-events-none para no estorbar.
 * Se respeta prefers-reduced-motion via la regla global en globals.css.
 */

const COLORS = ["#2a9d5b", "#ffcf33", "#38bdf8", "#ff6b6b", "#a78bfa"];

export function Confetti({ pieces = 24 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.1 + Math.random() * 0.7,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.round(Math.random() * 6),
        rounded: i % 2 === 0
      })),
    [pieces]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: b.color,
            borderRadius: b.rounded ? "9999px" : "2px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`
          }}
        />
      ))}
    </div>
  );
}
