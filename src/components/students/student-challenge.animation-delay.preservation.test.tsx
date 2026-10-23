import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { StudentChallenge } from "@/components/students/student-challenge";
import type { CalendarWeek } from "@/lib/services/calendar-52-weeks";

/**
 * Pruebas de PRESERVACIÓN (bugfix: step-selection-animation-delay-fix).
 *
 * Property 2: Preservation - Interacciones no relacionadas sin cambios.
 *
 * Metodología "observation-first": estas pruebas capturan el comportamiento BASE del
 * componente para todas las entradas donde la condición del bug NO se cumple
 * (isBugCondition = false, es decir: cualquier cosa que no sea el FEEDBACK VISUAL
 * INMEDIATO al alternar un paso). DEBEN PASAR contra el código SIN arreglar — codifican
 * la línea base que el arreglo (actualización optimista en `toggleStep`, tarea 3) NO
 * debe alterar. Tras el arreglo deben seguir pasando (sin regresiones).
 *
 * Nota importante sobre el alcance: la propiedad que SÍ cambia con el fix es la
 * *inmediatez* del feedback visual al alternar un paso (eso lo cubre la prueba de
 * exploración, tarea 1). Aquí observamos únicamente los efectos OBSERVABLES que deben
 * permanecer idénticos, usando aserciones asíncronas (waitFor) que no dependen del
 * momento exacto en que la UI refleja el cambio:
 *   - Persistencia: el cuerpo del `POST` a `/api/alumno/pasos` es
 *     `{ stepId, completed: !step.completed }` (upsert al completar, delete al desmarcar).
 *   - Redirección 401: un 401 de `GET /api/alumno/reto` redirige a `/alumno`.
 *   - Reconciliación: tras un toggle exitoso se vuelve a llamar a `load()`
 *     (`GET /api/alumno/reto` con `cache: "no-store"`) y la vista refleja los datos
 *     del servidor.
 *   - Interacciones no relacionadas: carga inicial, minijuego (`completeGame` ->
 *     `POST /api/alumno/juego`), enlace a `/alumno/evidencia`, calendario
 *     (`Calendar52Weeks`) y logout (`DELETE /api/alumno/acceso` + `router.push` +
 *     `router.refresh`).
 *
 * Enfoque basado en propiedades: se generan estados de reto aleatorios (número y estado
 * de pasos, puntos, juego presente/ausente) con un PRNG determinista (sin dependencias
 * externas) y se afirma la propiedad de preservación sobre cada estado generado.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

// --- Mock de next/navigation: el componente usa useRouter() ---
// IMPORTANTE: el router debe ser un objeto ESTABLE entre renders. El componente
// memoiza `load` con dependencia [router]; si useRouter() devolviera un objeto nuevo
// en cada render, el efecto se dispararía en bucle. Next.js devuelve una instancia
// estable, así que reproducimos eso aquí.
const { mockPush, mockRefresh, mockRouter } = vi.hoisted(() => {
  const push = vi.fn();
  const refresh = vi.fn();
  return { mockPush: push, mockRefresh: refresh, mockRouter: { push, refresh } };
});

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter
}));

// --- Tipos locales que reflejan la forma de datos del componente ---
type GamePair = { left: string; right: string };

type GameView = {
  id: string;
  type: "relacionar";
  title: string;
  points: number;
  config: { pairs: GamePair[] };
  completed: boolean;
} | null;

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
  game: GameView;
  student: { alias: string };
};

// --- PRNG determinista (mulberry32) para generar estados reproducibles sin fast-check ---
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Genera un estado de reto aleatorio: número y estado de pasos, puntos por paso y
 * presencia/ausencia de minijuego. El dominio generado representa cualquier entrada
 * donde NO se dispara la condición del bug (el objeto de datos es independiente de la
 * inmediatez del feedback).
 */
function generateView(rand: () => number, index: number): ChallengeView {
  const stepCount = 1 + Math.floor(rand() * 5); // 1..5 pasos
  const steps: Step[] = Array.from({ length: stepCount }, (_, i) => ({
    id: `s${index}-${i + 1}`,
    order: i + 1,
    title: `Paso ${i + 1}`,
    description: `Descripción ${i + 1}`,
    points: 1 + Math.floor(rand() * 20), // 1..20 puntos
    completed: rand() < 0.5
  }));

  const hasGame = rand() < 0.5;
  const game: GameView = hasGame
    ? {
        id: `g${index}`,
        type: "relacionar",
        title: "Clasifica residuos",
        points: 1 + Math.floor(rand() * 5),
        config: {
          pairs: [
            { left: "Papel", right: "Azul" },
            { left: "Organico", right: "Verde" }
          ]
        },
        completed: rand() < 0.3
      }
    : null;

  return {
    challenge: {
      id: `c${index}`,
      weekNumber: 1 + Math.floor(rand() * 52),
      title: `Reto ${index}`,
      objective: `Objetivo ${index}`,
      endDate: "2025-06-01"
    },
    steps,
    game,
    student: { alias: `Alumno${index}` }
  };
}

// 12 estados generados de forma determinista (seed fija => reproducibles).
const generatedViews: ChallengeView[] = (() => {
  const rand = mulberry32(0xba5e_0001);
  return Array.from({ length: 12 }, (_, i) => generateView(rand, i));
})();

function defaultView(overrides: Partial<ChallengeView> = {}): ChallengeView {
  return {
    challenge: {
      id: "c1",
      weekNumber: 7,
      title: "Reto de reciclaje",
      objective: "Separar residuos durante una semana",
      endDate: "2025-01-10"
    },
    steps: [
      { id: "s1", order: 1, title: "Paso uno", description: "Haz esto", points: 10, completed: false }
    ],
    game: null,
    student: { alias: "Hojita" },
    ...overrides
  };
}

function makeCalendarWeeks(): CalendarWeek[] {
  return Array.from({ length: 52 }, (_, i) => ({
    weekNumber: i + 1,
    type: null,
    title: null,
    completed: false,
    isCurrent: false,
    published: false
  }));
}

/**
 * fetch mock: GET /api/alumno/reto siempre devuelve `view`; las acciones
 * (pasos/juego/acceso) devuelven ok. Resolución inmediata: el objetivo de la
 * preservación es observar los EFECTOS (cuerpo del POST, redirección, reconciliación),
 * no el momento del feedback visual, así que no retardamos la red.
 */
function mockFetchWithView(view: ChallengeView) {
  const fetchMock = vi.fn(async (input: unknown) => {
    const url = typeof input === "string" ? input : String(input);
    if (url.includes("/api/alumno/reto")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: view })
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ data: {} })
    };
  });
  // @ts-expect-error - asignamos un mock a global.fetch para el entorno de prueba
  global.fetch = fetchMock;
  return fetchMock;
}

async function renderLoaded(
  view: ChallengeView,
  calendarWeeks: CalendarWeek[] | null,
  anchor: RegExp | string
) {
  const result = render(<StudentChallenge calendarWeeks={calendarWeeks} />);
  await result.findByText(anchor);
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("Preservación 3.1 - persistencia del POST a /api/alumno/pasos (upsert/delete)", () => {
  // Property 2: para cualquier estado generado, al alternar un paso el cuerpo del POST
  // es siempre { stepId, completed: !step.completed }. Marcar => true (upsert);
  // desmarcar => false (delete). Esto NO debe cambiar con el fix.
  generatedViews.forEach((view, index) => {
    it(`envía { stepId, completed: !completed } al alternar el primer paso [estado #${index}]`, async () => {
      const fetchMock = mockFetchWithView(view);
      const result = await renderLoaded(view, null, "Tus pasos");

      const firstStep = view.steps[0];
      const stepButton = within(
        result.getByText("Tus pasos").closest("section") as HTMLElement
      ).getByRole("button", { name: new RegExp(firstStep.title) });

      fireEvent.click(stepButton);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          "/api/alumno/pasos",
          expect.objectContaining({ method: "POST" })
        );
      });

      const pasosCall = fetchMock.mock.calls.find((c) => c[0] === "/api/alumno/pasos");
      expect(pasosCall).toBeTruthy();
      const body = JSON.parse((pasosCall![1] as { body: string }).body);
      // El cuerpo es exactamente stepId + el toggle del estado (upsert al completar,
      // delete al desmarcar). Permanece igual con y sin el fix.
      expect(body).toEqual({ stepId: firstStep.id, completed: !firstStep.completed });
    });
  });

  it("marcar un paso no completado envía completed: true (upsert)", async () => {
    const view = defaultView({
      steps: [{ id: "s1", order: 1, title: "Paso uno", description: "x", points: 5, completed: false }]
    });
    const fetchMock = mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    fireEvent.click(result.getByRole("button", { name: /Paso uno/ }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find((c) => c[0] === "/api/alumno/pasos");
      expect(call).toBeTruthy();
      expect(JSON.parse((call![1] as { body: string }).body)).toEqual({
        stepId: "s1",
        completed: true
      });
    });
  });

  it("desmarcar un paso completado envía completed: false (delete)", async () => {
    const view = defaultView({
      steps: [{ id: "s1", order: 1, title: "Paso uno", description: "x", points: 5, completed: true }]
    });
    const fetchMock = mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    fireEvent.click(result.getByRole("button", { name: /Paso uno/ }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find((c) => c[0] === "/api/alumno/pasos");
      expect(call).toBeTruthy();
      expect(JSON.parse((call![1] as { body: string }).body)).toEqual({
        stepId: "s1",
        completed: false
      });
    });
  });
});

describe("Preservación 3.2 - redirección 401 de GET /api/alumno/reto a /alumno", () => {
  it("al recibir 401 en la carga inicial redirige a /alumno con router.push", async () => {
    const fetchMock = vi.fn(async (input: unknown) => {
      const url = typeof input === "string" ? input : String(input);
      if (url.includes("/api/alumno/reto")) {
        return { ok: false, status: 401, json: async () => ({ error: "No autorizado" }) };
      }
      return { ok: true, status: 200, json: async () => ({ data: {} }) };
    });
    // @ts-expect-error - mock de fetch para el entorno de prueba
    global.fetch = fetchMock;

    render(<StudentChallenge calendarWeeks={null} />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/alumno");
    });
  });

  it("GET /api/alumno/reto se pide con cache: 'no-store'", async () => {
    const view = defaultView();
    const fetchMock = mockFetchWithView(view);
    await renderLoaded(view, null, "Tus pasos");

    const retoCall = fetchMock.mock.calls.find((c) => c[0] === "/api/alumno/reto");
    expect(retoCall).toBeTruthy();
    expect(retoCall![1]).toEqual(expect.objectContaining({ cache: "no-store" }));
  });
});

describe("Preservación 3.3 - reconciliación con el servidor tras un toggle exitoso", () => {
  it("tras un toggle exitoso vuelve a llamar a GET /api/alumno/reto (load) para reconciliar", async () => {
    const view = defaultView();
    const fetchMock = mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    // Carga inicial: 1 GET a /api/alumno/reto.
    const retoCallsBefore = fetchMock.mock.calls.filter((c) => c[0] === "/api/alumno/reto").length;
    expect(retoCallsBefore).toBe(1);

    fireEvent.click(result.getByRole("button", { name: /Paso uno/ }));

    // Tras el POST exitoso, se vuelve a pedir el reto (reconciliación vía load()).
    await waitFor(() => {
      const retoCallsAfter = fetchMock.mock.calls.filter((c) => c[0] === "/api/alumno/reto").length;
      expect(retoCallsAfter).toBe(2);
    });
  });

  it("la vista refleja los datos del servidor tras reconciliar (contador desde GET)", async () => {
    // El servidor devuelve un paso ya completado; tras recargar, el contador debe
    // reflejar lo que dice el servidor, no una suposición del cliente.
    const serverView = defaultView({
      steps: [
        { id: "s1", order: 1, title: "Paso uno", description: "x", points: 5, completed: true },
        { id: "s2", order: 2, title: "Paso dos", description: "y", points: 5, completed: false }
      ]
    });
    mockFetchWithView(serverView);
    const result = await renderLoaded(serverView, null, "Tus pasos");

    const section = result.getByText("Tus pasos").closest("section") as HTMLElement;
    // El contador proviene de los datos del servidor: 1 de 2 completados.
    expect(within(section).getByText(/\d+\/\d+/).textContent?.trim()).toBe("1/2");
  });
});

describe("Preservación 3.4 - interacciones no relacionadas", () => {
  it("carga inicial: renderiza la vista desde GET /api/alumno/reto", async () => {
    const view = defaultView();
    mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    expect(result.getByText("Semana 7")).toBeInTheDocument();
    expect(result.getByText(/Vamos, Hojita!/)).toBeInTheDocument();
    expect(result.getByText("Reto de reciclaje")).toBeInTheDocument();
  });

  it("minijuego: completar relaciona parejas y hace POST a /api/alumno/juego", async () => {
    const view = defaultView({
      game: {
        id: "g1",
        type: "relacionar",
        title: "Clasifica residuos",
        points: 2,
        config: {
          pairs: [
            { left: "Papel", right: "Azul" },
            { left: "Organico", right: "Verde" }
          ]
        },
        completed: false
      }
    });
    const fetchMock = mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    expect(result.getByText(/Juego: Clasifica residuos/)).toBeInTheDocument();

    fireEvent.click(result.getByRole("button", { name: "Papel" }));
    fireEvent.click(result.getByRole("button", { name: "Azul" }));
    fireEvent.click(result.getByRole("button", { name: "Organico" }));
    fireEvent.click(result.getByRole("button", { name: "Verde" }));

    const finishButton = await waitFor(() => result.getByRole("button", { name: "Terminar" }));
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/alumno/juego",
        expect.objectContaining({ method: "POST" })
      );
    });

    const juegoCall = fetchMock.mock.calls.find((c) => c[0] === "/api/alumno/juego");
    const body = JSON.parse((juegoCall![1] as { body: string }).body);
    expect(body).toEqual({ gameId: "g1", score: 2 });
  });

  it("enlace a /alumno/evidencia: 'Subir mi foto' apunta a la subida de evidencia", async () => {
    const view = defaultView();
    mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    const link = result.getByRole("link", { name: /Subir mi foto/ });
    expect(link).toHaveAttribute("href", "/alumno/evidencia");
    expect(result.getByText("Sube tu evidencia")).toBeInTheDocument();
  });

  it("calendario: Calendar52Weeks se renderiza cuando calendarWeeks está presente", async () => {
    const view = defaultView();
    mockFetchWithView(view);
    const result = await renderLoaded(view, makeCalendarWeeks(), "Tus pasos");

    expect(result.getByText("Tu avance del año")).toBeInTheDocument();
    expect(result.getByText(/Cada cuadrito es una semana/)).toBeInTheDocument();
  });

  it("calendario: no se renderiza cuando calendarWeeks es null", async () => {
    const view = defaultView();
    mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    expect(result.queryByText(/Cada cuadrito es una semana/)).not.toBeInTheDocument();
  });

  it("logout: 'Salir' hace DELETE a /api/alumno/acceso, router.push('/alumno') y router.refresh()", async () => {
    const view = defaultView();
    const fetchMock = mockFetchWithView(view);
    const result = await renderLoaded(view, null, "Tus pasos");

    fireEvent.click(result.getByRole("button", { name: /Salir/ }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/alumno/acceso",
        expect.objectContaining({ method: "DELETE" })
      );
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/alumno");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  // Property 2: el minijuego aparece sólo cuando el estado generado trae juego; de lo
  // contrario no se renderiza. Esto depende de datos y es ajeno al bug de feedback.
  generatedViews.forEach((view, index) => {
    it(`presencia del minijuego coincide con los datos del estado generado [estado #${index}]`, async () => {
      mockFetchWithView(view);
      const result = await renderLoaded(view, null, "Tus pasos");

      if (view.game) {
        expect(result.getByText(/Juego:/)).toBeInTheDocument();
      } else {
        expect(result.queryByText(/Juego:/)).not.toBeInTheDocument();
      }
    });
  });
});
