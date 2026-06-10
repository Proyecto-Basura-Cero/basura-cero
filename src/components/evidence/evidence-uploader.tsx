"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-message";
import { supabaseClient } from "@/lib/supabase/client";

type Group = { id: string; name: string; grade: string };

type Challenge = {
  id: string;
  weekNumber: number;
  title: string;
  endDate: string;
};

type Status = "submitted" | "draft";

export function EvidenceUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    groupId: "",
    comments: "",
    participantsCount: 1,
    kgSeparated: 0,
    reusedItems: 0
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const draftId = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [gRes, cRes] = await Promise.all([
          fetch("/api/maestro/grupos", { cache: "no-store" }),
          fetch("/api/maestro/reto-actual", { cache: "no-store" })
        ]);
        const gPayload = await gRes.json();
        const cPayload = await cRes.json();
        if (cancelled) return;

        if (gRes.status === 401 || cRes.status === 401) {
          setError("Tu sesion expiro. Vuelve a iniciar sesion para subir evidencias.");
          setChallenge(null);
          setGroups([]);
          return;
        }

        if (!gRes.ok) throw new Error(gPayload.error ?? "No se pudieron cargar los grupos");
        if (!cRes.ok) throw new Error(cPayload.error ?? "No se pudo cargar el reto");
        setGroups(gPayload.data ?? []);
        if (cPayload.data) {
          setChallenge({
            id: cPayload.data.id,
            weekNumber: cPayload.data.weekNumber,
            title: cPayload.data.title,
            endDate: cPayload.data.endDate
          });
        } else {
          setChallenge(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: File[] = [...files];
    for (let i = 0; i < incoming.length; i += 1) {
      next.push(incoming[i]);
    }
    setFiles(next);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const submit = useCallback(
    async (status: Status) => {
      setError(null);
      setSuccessMessage(null);

      if (!challenge) {
        setError("No hay reto activo");
        return;
      }
      if (!form.groupId) {
        setError("Selecciona un grupo");
        return;
      }
      if (!files.length) {
        setError("Adjunta al menos una evidencia");
        return;
      }
      if (form.comments.trim().length < 5) {
        setError("Escribe un comentario breve (minimo 5 caracteres)");
        return;
      }

      setSubmitting(true);
      try {
        const uploaded: Array<{ path: string; type: string }> = [];
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          setUploadProgress(`Subiendo ${i + 1} de ${files.length}: ${file.name}`);
          const signRes = await fetch("/api/maestro/storage/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: form.groupId,
              draftId,
              filename: file.name
            })
          });
          const signPayload = await signRes.json();
          if (!signRes.ok) {
            throw new Error(signPayload.error ?? "No se pudo firmar la subida");
          }
          const { error: uploadError } = await supabaseClient.storage
            .from(signPayload.bucket)
            .uploadToSignedUrl(signPayload.path, signPayload.token, file, {
              contentType: file.type || "application/octet-stream"
            });
          if (uploadError) {
            throw new Error(uploadError.message);
          }
          uploaded.push({
            path: signPayload.path,
            type: file.type || "application/octet-stream"
          });
        }

        setUploadProgress("Guardando evidencia...");
        const res = await fetch("/api/maestro/evidencias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: form.groupId,
            challengeId: challenge.id,
            comments: form.comments,
            participantsCount: form.participantsCount,
            kgSeparated: form.kgSeparated,
            reusedItems: form.reusedItems,
            files: uploaded,
            status
          })
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error ?? "No se pudo guardar la evidencia");
        }

        setSuccessMessage(
          status === "submitted"
            ? "Evidencia enviada. Puntaje calculado automaticamente."
            : "Borrador guardado."
        );
        setFiles([]);
        setForm({
          groupId: form.groupId,
          comments: "",
          participantsCount: 1,
          kgSeparated: 0,
          reusedItems: 0
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setSubmitting(false);
        setUploadProgress(null);
      }
    },
    [challenge, draftId, files, form, router]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm text-slate-500">
        Cargando formulario...
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit("submitted");
      }}
      className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-emerald-700">
          Subir evidencia semanal
        </h3>
        {challenge ? (
          <p className="text-xs text-slate-500">
            Reto activo: Semana {challenge.weekNumber} - {challenge.title}
          </p>
        ) : (
          <p className="text-xs text-amber-700">
            No hay reto activo en tu escuela. El administrador debe activar la semana
            actual.
          </p>
        )}
      </header>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">Grupo</span>
        <select
          required
          value={form.groupId}
          onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          className="rounded-lg border border-slate-300 p-2"
          disabled={!groups.length}
        >
          <option value="">
            {groups.length ? "Selecciona un grupo" : "No tienes grupos asignados"}
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.grade})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">Comentarios y aprendizajes</span>
        <textarea
          required
          rows={3}
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          className="rounded-lg border border-slate-300 p-2"
          placeholder="Describe lo que hizo el grupo, dificultades, hallazgos..."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Participantes</span>
          <input
            type="number"
            min={0}
            value={form.participantsCount}
            onChange={(e) =>
              setForm({ ...form, participantsCount: Number(e.target.value) })
            }
            className="rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Kg separados</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={form.kgSeparated}
            onChange={(e) =>
              setForm({ ...form, kgSeparated: Number(e.target.value) })
            }
            className="rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Materiales reutilizados</span>
          <input
            type="number"
            min={0}
            value={form.reusedItems}
            onChange={(e) =>
              setForm({ ...form, reusedItems: Number(e.target.value) })
            }
            className="rounded-lg border border-slate-300 p-2"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-700">Evidencias (fotos o PDF)</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            className="rounded-lg border border-slate-300 p-2"
          />
        </label>
        {files.length > 0 && (
          <ul className="space-y-1 text-xs text-slate-600">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2 py-1"
              >
                <span className="truncate">
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {uploadProgress && (
        <p className="text-xs text-slate-500">{uploadProgress}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting || !challenge || !groups.length}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar evidencia"}
        </button>
        <button
          type="button"
          onClick={() => void submit("draft")}
          disabled={submitting || !challenge || !groups.length}
          className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
        >
          Guardar borrador
        </button>
      </div>
    </form>
  );
}
