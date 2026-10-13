import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";

/**
 * Generacion y verificacion de codigos de acceso de alumno.
 *
 * Privacidad: el codigo NO deriva de datos personales. Se almacena solo su
 * hash (SHA-256 con sal por fila) y un prefijo no sensible para que el maestro
 * lo reconozca al listarlo. El codigo en claro se muestra una sola vez.
 */

// Alfabeto legible para primaria, sin caracteres ambiguos (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6; // 2 grupos de 3 => "ABC-123"

export function generateAccessCode(): string {
  let raw = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    raw += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

/** Normaliza para comparar: mayusculas, sin espacios ni guiones. */
export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function codePrefix(code: string): string {
  return normalizeCode(code).slice(0, 2);
}

export function hashCode(code: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${normalizeCode(code)}`).digest("hex");
}

export function makeSalt(): string {
  return randomBytes(16).toString("hex");
}

/**
 * El code_hash se persiste como "salt$hash" para poder verificar sin otra tabla.
 */
export function buildStoredHash(code: string): string {
  const salt = makeSalt();
  return `${salt}$${hashCode(code, salt)}`;
}

export function verifyStoredHash(code: string, stored: string): boolean {
  const [salt, expected] = stored.split("$");
  if (!salt || !expected) return false;
  const actual = hashCode(code, salt);
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
