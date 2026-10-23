import { Mascot, type MascotMood } from "@/components/students/mascot";

/**
 * Mascota + globo de dialogo. Se usa para saludos y mensajes de animo en la
 * zona del alumno. El texto del globo es el mensaje "hablado" por Hojita.
 */
export function MascotBubble({
  mood = "hola",
  size = 88,
  title,
  message,
  className
}: {
  mood?: MascotMood;
  size?: number;
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative flex-1 rounded-2xl bg-white px-4 py-3 shadow-sm">
        {/* pico del globo apuntando a la mascota */}
        <span
          aria-hidden
          className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white"
        />
        {title && (
          <p className="relative font-display text-base font-bold text-slate-800">{title}</p>
        )}
        <p className="relative text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
