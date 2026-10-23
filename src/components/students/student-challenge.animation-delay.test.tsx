import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { StudentChallenge } from "@/components/students/student-challenge";

/**
 * Prueba de EXPLORACIÓN de la condición del bug
 * (bugfix: step-selection-animation-delay-fix).
 *
 * Property 1: Bug Condition - Feedback visual inmediato al alternar un paso.
 *
 * Esta prueba codifica el COMPORTAMIENTO ESPERADO (actualización optimista): al tocar
 * un paso, su apariencia (CheckCircle2 vs Circle, clase `animate-pop`, `aria-pressed`),
 * el contador `completados/total`, la barra de XP y el ánimo de la mascota deben
 * invertirse DE INMEDIATO, de forma SÍNCRONA, antes de que termine el viaje
 * `POST /api/alumno/pasos` + `load()` (`GET /api/alumno/reto`).
 *
 * Por diseño DEBE FALLAR contra el código SIN arreglar (sin actualización optimista):
 * el estado visual solo cambia tras el refetch completo, por lo que la aserción
 * síncrona "ya cambió" no se cumple. El fallo es el CONTRAEJEMPLO que demuestra el bug.
 * Cuando el arreglo se implemente (tarea 3), esta misma prueba debe PASAR.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4
 */

// --- Mock de next/navigation: el componente usa useRouter() ---
// El router debe ser un objeto ESTABLE entre renders (el componente memoiza `load`
// con dependencia [router]); un router nuevo en cada render dispararía el efecto en
// bucle. Next.js devuelve una instancia estable, así que reproducimos eso aquí.
const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), refresh: vi.fn() }
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter
}));

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
  game: null;
  student: { alias: string };
};

function makeView(overrides: Partial<ChallengeView> = {}): ChallengeView {
  return {
    challenge: {
      id: "c1",
      weekNumber: 7,
      title: "Reto de reciclaje",
      objective: "Separar residuos durante una semana",
      endDate: "2025-01-10"
    },
    steps: [
      {
        id: "s1",
        order: 1,
        title: "Paso uno",
        description: "Haz esto",
        points: 10,
        completed: false
      },
      {
        id: "s2",
        order: 2,
        title: "Paso dos",
        description: "Haz esto otro",
        points: 10,
        completed: false
      }
    ],
    game: null,
    student: { alias: "Hojita" },
    ...overrides
  };
}

type Deferred = {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

function makeDeferred(): Deferred {
  let resolve!: (value: unknown) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<unknown>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * fetch mock con RED RETARDADA para POST /api/alumno/pasos.
 *
 * - GET /api/alumno/reto: resuelve de inmediato con `view` (carga inicial y refetch).
 * - POST /api/alumno/pasos: devuelve una promesa que NO resuelve hasta que el test
 *   lo decida (deferred). Así podemos observar el estado SÍNCRONO del DOM mientras el
 *   POST sigue "en vuelo", que es justo el momento donde el bug es visible.
 */
function mockFetchDelayedPost(view: ChallengeView) {
  const postDeferred = makeDeferred();
  const fetchMock = vi.fn((input: unknown) => {
    const url = typeof input === "string" ? input : String(input);
    if (url.includes("/api/alumno/pasos")) {
      // Promesa retardada: la red "tarda". Resolvemos manualmente en el test.
      return postDeferred.promise.then(() => ({
        ok: true,
        status: 200,
        json: async () => ({ data: {} })
      }));
    }
    // GET /api/alumno/reto (y cualquier otra) resuelve de inmediato.
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: view })
    });
  });
  // @ts-expect-error - asignamos un mock a global.fetch para el entorno de prueba
  global.fetch = fetchMock;
  return { fetchMock, postDeferred };
}

async function renderLoaded() {
  const result = render(<StudentChallenge calendarWeeks={null} />);
  // Esperar a que termine la carga inicial y aparezca la lista de pasos.
  await result.findByText("Tus pasos");
  return result;
}

// Anclas del DOM que reflejan el estado visual del paso:
// - El botón del paso tiene aria-pressed y, cuando está completado, clase animate-pop.
function getStepButton(result: ReturnType<typeof render>, title: RegExp | string) {
  return result.getByRole("button", { name: title });
}

// El contador completados/total vive en el span con el ícono Trophy: "x/y".
function getCounterText(result: ReturnType<typeof render>) {
  const pasosHeading = result.getByText("Tus pasos");
  const section = pasosHeading.closest("section") as HTMLElement;
  // El span del contador contiene el patrón "n/m" (puede venir con espacios por el
  // ícono Trophy adyacente en el JSX, así que normalizamos con trim).
  return within(section).getByText(/\d+\/\d+/).textContent?.trim();
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("StudentChallenge - Bug Condition: feedback inmediato al alternar un paso", () => {
  it("2.1/2.3 marcar un paso invierte su apariencia y el contador DE INMEDIATO (red lenta)", async () => {
    const view = makeView();
    const { postDeferred } = mockFetchDelayedPost(view);
    const result = await renderLoaded();

    const stepButton = getStepButton(result, /Paso uno/);
    // Estado base: no completado.
    expect(stepButton).toHaveAttribute("aria-pressed", "false");
    expect(stepButton.className).not.toContain("animate-pop");
    expect(getCounterText(result)).toBe("0/2");

    // Clic en el paso: el POST queda EN VUELO (no resolvemos postDeferred).
    fireEvent.click(stepButton);

    // Aserción SÍNCRONA (antes de resolver el POST + load):
    // el feedback optimista ya debería reflejarse. En el código SIN arreglar,
    // nada cambia hasta que termina el viaje, así que esto FALLA (contraejemplo).
    const afterClick = getStepButton(result, /Paso uno/);
    expect(afterClick).toHaveAttribute("aria-pressed", "true");
    expect(afterClick.className).toContain("animate-pop");
    expect(getCounterText(result)).toBe("1/2");

    // Limpieza: resolvemos el POST en vuelo para evitar promesas colgadas.
    await act(async () => {
      postDeferred.resolve(undefined);
    });
  });

  it("2.1/2.3 desmarcar un paso completado revierte su apariencia y el contador DE INMEDIATO", async () => {
    const view = makeView({
      steps: [
        { id: "s1", order: 1, title: "Paso uno", description: "Haz esto", points: 10, completed: true },
        { id: "s2", order: 2, title: "Paso dos", description: "Haz esto otro", points: 10, completed: false }
      ]
    });
    const { postDeferred } = mockFetchDelayedPost(view);
    const result = await renderLoaded();

    const stepButton = getStepButton(result, /Paso uno/);
    expect(stepButton).toHaveAttribute("aria-pressed", "true");
    expect(stepButton.className).toContain("animate-pop");
    expect(getCounterText(result)).toBe("1/2");

    fireEvent.click(stepButton);

    // Aserción SÍNCRONA: debería volver a "no completado" al instante.
    const afterClick = getStepButton(result, /Paso uno/);
    expect(afterClick).toHaveAttribute("aria-pressed", "false");
    expect(afterClick.className).not.toContain("animate-pop");
    expect(getCounterText(result)).toBe("0/2");

    await act(async () => {
      postDeferred.resolve(undefined);
    });
  });

  it("1.3/2.3 marcar el último paso pendiente actualiza contador, XP y mascota DE INMEDIATO", async () => {
    // Un solo paso pendiente: marcarlo deja el reto completo (contador, XP al 100%,
    // mascota en "celebra" con su mensaje de festejo).
    const view = makeView({
      steps: [
        { id: "s1", order: 1, title: "Paso uno", description: "Haz esto", points: 10, completed: false }
      ]
    });
    const { postDeferred } = mockFetchDelayedPost(view);
    const result = await renderLoaded();

    expect(getCounterText(result)).toBe("0/1");
    // Barra de XP: 0 de 10 al inicio.
    expect(result.getByLabelText(/Llevas 0 de 10 puntos esta semana/)).toBeInTheDocument();
    // Mascota en ánimo (no celebra) al inicio.
    expect(result.getByText(/Completa tus pasos y sube tu foto/)).toBeInTheDocument();

    fireEvent.click(getStepButton(result, /Paso uno/));

    // Aserción SÍNCRONA tras el clic, con el POST en vuelo:
    // contador, XP y mascota deberían reflejar el estado optimista ya.
    expect(getCounterText(result)).toBe("1/1");
    expect(result.getByLabelText(/Llevas 10 de 10 puntos esta semana/)).toBeInTheDocument();
    expect(result.getByText(/Terminaste todos tus pasos/)).toBeInTheDocument();

    await act(async () => {
      postDeferred.resolve(undefined);
    });
  });

  it("2.4 edge case: si el POST falla, no hay reversión optimista en el código sin arreglar", async () => {
    // En el código arreglado: el paso cambia optimista, luego el POST falla y se
    // revierte al estado anterior mostrando el error (role="alert").
    // En el código sin arreglar: nunca hubo cambio optimista, por lo que no existe
    // reversión; lo que esta prueba exige (cambio optimista inmediato + reversión al
    // fallar) no se cumple -> contraejemplo.
    const view = makeView({
      steps: [
        { id: "s1", order: 1, title: "Paso uno", description: "Haz esto", points: 10, completed: false }
      ]
    });
    const errorDeferred = makeDeferred();
    const fetchMock = vi.fn((input: unknown) => {
      const url = typeof input === "string" ? input : String(input);
      if (url.includes("/api/alumno/pasos")) {
        return errorDeferred.promise.then(() => ({
          ok: false,
          status: 500,
          json: async () => ({ error: "No se pudo guardar" })
        }));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ data: view })
      });
    });
    // @ts-expect-error - mock de fetch para el entorno de prueba
    global.fetch = fetchMock;

    const result = render(<StudentChallenge calendarWeeks={null} />);
    await result.findByText("Tus pasos");

    const stepButton = getStepButton(result, /Paso uno/);
    expect(stepButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(stepButton);

    // Aserción SÍNCRONA: el cambio optimista debería verse antes de que el POST falle.
    const afterClick = getStepButton(result, /Paso uno/);
    expect(afterClick).toHaveAttribute("aria-pressed", "true");

    // Ahora el POST falla: la vista debe revertir al estado anterior y mostrar error.
    await act(async () => {
      errorDeferred.resolve(undefined);
    });

    await waitFor(() => {
      expect(result.getByRole("alert")).toBeInTheDocument();
    });
    // Tras la reversión, el paso vuelve a "no completado".
    expect(getStepButton(result, /Paso uno/)).toHaveAttribute("aria-pressed", "false");
  });
});
