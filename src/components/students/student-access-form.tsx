"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";
import { Mascot } from "@/components/students/mascot";

function AccessFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefill = searchParams.get("codigo");
    if (prefill) setCode(prefill.toUpperCase());
  }, [searchParams]);

  const enter = async () => {
    setError(null);
    if (code.trim().length < 4) {
      setError("Escribe tu codigo completo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/alumno/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No pudimos entrar");
      router.push("/alumno/reto");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border-4 border-emerald-200 bg-white p-8 text-center shadow-sm">
      <Mascot mood="hola" size={104} className="mx-auto" />
      <h1 className="mt-3 text-3xl font-black text-emerald-700">Hola!</h1>
      <p className="mt-2 text-lg text-slate-600">
        Escribe tu codigo para empezar a jugar y cuidar el planeta.
      </p>

      <label htmlFor="codigo" className="sr-only">
        Tu codigo de acceso
      </label>
      <input
        id="codigo"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => {
          if (e.key === "Enter") void enter();
        }}
        placeholder="ABC-123"
        autoComplete="off"
        className="mt-6 w-full rounded-2xl border-4 border-emerald-200 bg-emerald-50 px-4 py-5 text-center text-4xl font-black uppercase tracking-widest text-emerald-800 outline-none focus:border-emerald-400"
        maxLength={10}
      />

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-base font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void enter()}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-2xl font-black text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60 disabled:active:scale-100"
      >
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
        ) : (
          <KeyRound className="h-7 w-7" aria-hidden />
        )}
        Entrar
      </button>

      <p className="mt-4 text-sm text-slate-600">
        Tu maestra o maestro te da este codigo.
      </p>
    </div>
  );
}

export function StudentAccessForm() {
  return (
    <Suspense fallback={<div className="text-center text-slate-500">Cargando...</div>}>
      <AccessFormInner />
    </Suspense>
  );
}
