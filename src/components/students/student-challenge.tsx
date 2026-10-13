"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, CheckCircle2, Circle, LogOut, Sparkles, Trophy } from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";
import { MiniGame, type MiniGameData } from "@/components/students/mini-game";

type Step = {
  id: string;
  order: number;
  title: string;
  description: string;
  points: number;
  completed: boolean;
};

type ChallengeView = {
  challenge: {
    id: string;
    weekNumber: number;
    title: string;
    objective: string;
    endDate: string;
  } | null;
  steps: Step[];
  game: MiniGameData | null;
  student: { alias: string };
};

export function StudentChallenge() {
  const router = useRouter();
  const [view, setView] = useState<ChallengeView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyStep, setBusyStep] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/alumno/reto", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/alumno");
      return;
    }
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error ?? "No pudimos cargar tu reto");
    setView(payload.data);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const toggleStep = async (step: Step) => {
    setError(null);
    setBusyStep(step.id);
    try {
      const res = await fetch("/api/alumno/pasos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, completed: !step.completed })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No se pudo guardar");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyStep(null);
    }
  };

  const completeGame = async (score: number) => {
    if (!view?.game) return;
    const res = await fetch("/api/alumno/juego", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: view.game.id, score })
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error ?? "No se pudo guardar el juego");
    }
    await load();
  };

  const logout = async () => {
    await fetch("/api/alumno/acceso", { method: "DELETE" });
    router.push("/alumno");
    router.refresh();
  };

  if (loading) {
    return <div className="py-10 text-center text-lg text-slate-500">Cargando tu reto...</div>;
  }

  if (!view?.challenge) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border-4 border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-2xl font-black text-amber-800">Todavia no hay reto</h1>
        <p className="mt-2 text-base text-amber-900">
          Pregunta a tu maestra o maestro cuando empiece el reto de esta semana.
        </p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-5 rounded-2xl border-2 border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800"
        >
          Salir
        </button>
      </div>
    );
  }

  const completedSteps = view.steps.filter((s) => s.completed).length;
  const totalSteps = view.steps.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Hola, {view.student.alias}</p>
          <h1 className="text-2xl font-black text-emerald-700">
            Semana {view.challenge.weekNumber}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Salir
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-3xl border-4 border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-600" aria-hidden />
          <h2 className="text-xl font-black text-emerald-900">{view.challenge.title}</h2>
        </div>
        <p className="mt-2 text-base text-emerald-900">{view.challenge.objective}</p>
      </section>

      <section className="rounded-3xl border-4 border-emerald-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-emerald-700">Tus pasos</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
            <Trophy className="h-4 w-4" aria-hidden /> {completedSteps}/{totalSteps}
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {view.steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => void toggleStep(step)}
                disabled={busyStep === step.id}
                aria-pressed={step.completed}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  step.completed
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-7 w-7 shrink-0 text-slate-300" aria-hidden />
                )}
                <span>
                  <span className="block text-lg font-bold text-slate-800">{step.title}</span>
                  <span className="block text-sm text-slate-500">{step.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {view.game && <MiniGame game={view.game} onComplete={completeGame} />}

      <section className="rounded-3xl border-4 border-emerald-200 bg-white p-5 text-center">
        <Camera className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <h2 className="mt-2 text-xl font-black text-emerald-700">Sube tu evidencia</h2>
        <p className="mt-1 text-sm text-slate-500">
          Toma una foto de tu resultado. Importante: que no salgan caras de ninas ni ninos.
        </p>
        <Link
          href="/alumno/evidencia"
          className="mt-4 inline-block rounded-2xl bg-emerald-600 px-6 py-3 text-lg font-black text-white hover:bg-emerald-700"
        >
          Subir mi foto
        </Link>
      </section>
    </div>
  );
}
