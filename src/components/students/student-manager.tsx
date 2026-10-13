"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  KeyRound,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";

type Group = { id: string; name: string; grade: string };

type Student = {
  id: string;
  alias: string;
  grade: string | null;
  isActive: boolean;
  group: { id: string; name: string; grade: string };
  code: { prefix: string; expiresAt: string | null } | null;
};

type IssuedCode = { studentId: string; alias: string; code: string };

function accessUrl(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/alumno?codigo=${encodeURIComponent(code)}`;
}

export function StudentManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alias, setAlias] = useState("");
  const [grade, setGrade] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedCode | null>(null);

  const loadGroups = useCallback(async () => {
    const res = await fetch("/api/maestro/grupos", { cache: "no-store" });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error ?? "No se pudieron cargar los grupos");
    const list: Group[] = payload.data ?? [];
    setGroups(list);
    if (list.length && !groupId) setGroupId(list[0].id);
  }, [groupId]);

  const loadStudents = useCallback(async (gid: string) => {
    if (!gid) {
      setStudents([]);
      return;
    }
    const res = await fetch(`/api/maestro/alumnos?groupId=${gid}`, { cache: "no-store" });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error ?? "No se pudieron cargar los alumnos");
    setStudents(payload.data ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadGroups();
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadStudents(groupId);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, loadStudents]);

  const createStudent = async () => {
    setError(null);
    if (!groupId) {
      setError("Selecciona un grupo");
      return;
    }
    if (alias.trim().length < 2) {
      setError("Escribe un alias (minimo 2 caracteres)");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/maestro/alumnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, alias: alias.trim(), grade: grade.trim() || undefined })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No se pudo crear el alumno");
      setIssued({ studentId: payload.student.id, alias: payload.student.alias, code: payload.code });
      setAlias("");
      setGrade("");
      await loadStudents(groupId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const regenerateCode = async (student: Student) => {
    setError(null);
    setBusyId(student.id);
    try {
      const res = await fetch(`/api/maestro/alumnos/${student.id}/codigo`, { method: "POST" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No se pudo regenerar el codigo");
      setIssued({ studentId: student.id, alias: student.alias, code: payload.code });
      await loadStudents(groupId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (student: Student) => {
    setError(null);
    setBusyId(student.id);
    try {
      const res = await fetch(`/api/maestro/alumnos/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !student.isActive })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No se pudo actualizar");
      await loadStudents(groupId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const removeStudent = async (student: Student) => {
    setError(null);
    if (!window.confirm(`Eliminar al alumno "${student.alias}"? Esta accion no se puede deshacer.`)) {
      return;
    }
    setBusyId(student.id);
    try {
      const res = await fetch(`/api/maestro/alumnos/${student.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "No se pudo eliminar");
      await loadStudents(groupId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-sm text-slate-500">
        Cargando alumnos...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
        <strong>Privacidad:</strong> usa solo un apodo (alias). No registres nombres
        reales, apellidos, correos ni fotos donde se vea la cara de ninas y ninos.
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-700">Grupo</span>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
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

      {groupId && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-emerald-700">Agregar alumno</h3>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-slate-700">Alias</span>
              <input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="p.ej. Estrella01"
                className="rounded-lg border border-slate-300 p-2"
                maxLength={40}
              />
            </label>
            <label className="flex w-28 flex-col gap-1 text-sm">
              <span className="text-slate-700">Grado (opc.)</span>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="3o"
                className="rounded-lg border border-slate-300 p-2"
                maxLength={20}
              />
            </label>
            <button
              type="button"
              onClick={() => void createStudent()}
              disabled={creating}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Agregar
            </button>
          </div>
        </div>
      )}

      {issued && (
        <div className="rounded-2xl border border-emerald-300 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Codigo de acceso de {issued.alias}
              </p>
              <p className="mt-1 text-3xl font-black tracking-widest text-emerald-900">
                {issued.code}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Guardalo o imprimelo ahora: por seguridad no se vuelve a mostrar.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white p-2">
              <QRCodeSVG value={accessUrl(issued.code)} size={110} />
              <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500">
                <QrCode className="h-3 w-3" /> Escanear para entrar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIssued(null)}
            className="mt-3 text-xs font-medium text-slate-500 underline"
          >
            Listo, ocultar codigo
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {students.length === 0 && (
          <li className="rounded-xl border bg-white p-4 text-sm text-slate-500">
            Aun no hay alumnos en este grupo.
          </li>
        )}
        {students.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{s.alias}</span>
                {s.grade && <span className="text-xs text-slate-500">({s.grade})</span>}
                {s.isActive ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                    Activo
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    Inactivo
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {s.code ? (
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3 w-3" /> Codigo {s.code.prefix}****
                  </span>
                ) : (
                  "Sin codigo activo"
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void regenerateCode(s)}
                disabled={busyId === s.id}
                title="Regenerar codigo"
                className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Codigo
              </button>
              <button
                type="button"
                onClick={() => void toggleActive(s)}
                disabled={busyId === s.id}
                title={s.isActive ? "Desactivar" : "Activar"}
                className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {s.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                {s.isActive ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => void removeStudent(s)}
                disabled={busyId === s.id}
                title="Eliminar"
                className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
