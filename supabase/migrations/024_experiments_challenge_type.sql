-- Tipo de reto (categoria de accion ecologica) para colorear el calendario
-- visual de 52 semanas.
--
-- Cuatro tipos, alineados con el material del proyecto:
--   reducir     -> generar menos basura desde el origen
--   reutilizar  -> dar una segunda vida a los materiales
--   reciclar    -> clasificar y aprovechar reciclables
--   reflexionar -> observar, registrar y compartir aprendizajes
--
-- Compatibilidad hacia atras: la columna es nullable. Los experimentos
-- existentes quedan sin tipo (el calendario los pinta en gris "sin tipo")
-- hasta que un admin los configure al editar el reto.
--
-- El COLOR no se almacena: se deriva del tipo en el frontend (paleta eco-*
-- y acentos sun/sky/grape definidos en tailwind.config.ts).

alter table experiments
add column if not exists challenge_type text
  check (challenge_type in ('reducir', 'reutilizar', 'reciclar', 'reflexionar'));
