"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PartyPopper, RefreshCw } from "lucide-react";

type Pair = { left: string; right: string };

type RelacionarConfig = { pairs: Pair[] };

export type MiniGameData = {
  id: string;
  type: "relacionar" | "clasificar" | "arrastrar";
  title: string;
  points: number;
  config: unknown;
  completed: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isRelacionarConfig(config: unknown): config is RelacionarConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    Array.isArray((config as RelacionarConfig).pairs)
  );
}

/**
 * Mini-juego de "relacionar": el alumno une cada concepto de la izquierda con
 * su pareja de la derecha tocando (tap) ambos. Accesible por teclado (botones).
 * Los tipos clasificar/arrastrar reutilizan esta interaccion tap-to-pair.
 */
export function MiniGame({
  game,
  onComplete
}: {
  game: MiniGameData;
  onComplete: (score: number) => Promise<void> | void;
}) {
  const pairs = useMemo(
    () => (isRelacionarConfig(game.config) ? game.config.pairs : []),
    [game.config]
  );
  const rightOptions = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const [done, setDone] = useState(game.completed);
  const [saving, setSaving] = useState(false);

  const correctByLeft = useMemo(() => {
    const map = new Map<string, string>();
    pairs.forEach((p) => map.set(p.left, p.right));
    return map;
  }, [pairs]);

  if (!pairs.length) {
    return null;
  }

  const allMatched = Object.keys(matched).length === pairs.length;

  const tryMatch = (left: string, right: string) => {
    if (correctByLeft.get(left) === right) {
      setMatched((m) => ({ ...m, [left]: right }));
      setSelectedLeft(null);
      setWrong(null);
    } else {
      setWrong(right);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await onComplete(pairs.length);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setMatched({});
    setSelectedLeft(null);
    setWrong(null);
  };

  return (
    <section className="rounded-3xl border-4 border-emerald-200 bg-white p-5">
      <h2 className="text-xl font-black text-emerald-700">Juego: {game.title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Toca una tarjeta de la izquierda y luego su pareja de la derecha.
      </p>

      {done ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
          <PartyPopper className="h-6 w-6" aria-hidden />
          <span className="text-lg font-bold">Muy bien! Ganaste {game.points} puntos.</span>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <ul className="space-y-2">
              {pairs.map((p) => {
                const isMatched = matched[p.left] !== undefined;
                const isSelected = selectedLeft === p.left;
                return (
                  <li key={p.left}>
                    <button
                      type="button"
                      disabled={isMatched}
                      onClick={() => setSelectedLeft(p.left)}
                      className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-base font-semibold transition ${
                        isMatched
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : isSelected
                            ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      {isMatched && <CheckCircle2 className="mr-1 inline h-4 w-4" aria-hidden />}
                      {p.left}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="space-y-2">
              {rightOptions.map((right) => {
                const usedBy = Object.entries(matched).find(([, r]) => r === right);
                const isUsed = Boolean(usedBy);
                const isWrong = wrong === right;
                return (
                  <li key={right}>
                    <button
                      type="button"
                      disabled={isUsed || !selectedLeft}
                      onClick={() => selectedLeft && tryMatch(selectedLeft, right)}
                      className={`w-full rounded-2xl border-2 px-3 py-3 text-left text-base font-semibold transition ${
                        isUsed
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : isWrong
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 disabled:opacity-50"
                      }`}
                    >
                      {right}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void finish()}
              disabled={!allMatched || saving}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-lg font-black text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {allMatched ? "Terminar" : "Une todas las parejas"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Reiniciar
            </button>
          </div>
        </>
      )}
    </section>
  );
}
