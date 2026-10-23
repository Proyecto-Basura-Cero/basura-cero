-- Campos de la ficha del experimento (diseño "Experimento 1 - Auditoría de basura de un día").
--
-- Compatibilidad hacia atras: todos los campos son opcionales (nullable). Los
-- experimentos existentes siguen funcionando; la UI solo muestra cada bloque
-- cuando tiene contenido.
--
-- Mapeo con la ficha impresa:
--   hypothesis     -> Hipótesis
--   classification -> Clasificación (categorías: orgánica / reciclable / no reciclable)
--   observations   -> Observaciones (guía para el grupo)
--   results_prompt -> Resultados (pregunta guía)
--   drawing_prompt -> Gráfica o dibujo (instrucción)
--   final_message  -> Mensaje Final
--
-- Nota: "Dato Impactante" de la ficha reutiliza el campo existente curious_fact.
--       El "Procedimiento" (lista numerada) reutiliza el campo existente instructions.

alter table experiments
add column if not exists hypothesis text,
add column if not exists classification text,
add column if not exists observations text,
add column if not exists results_prompt text,
add column if not exists drawing_prompt text,
add column if not exists final_message text;
