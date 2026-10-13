-- Seed idempotente de pasos para los experimentos existentes.
--
-- Los 52 experimentos sembrados en 006 comparten la estructura de instructions:
--   '1) Separar residuos. 2) Registrar resultados. 3) Subir evidencia.'
-- Generamos 3 pasos por defecto por experimento. Idempotente via unique
-- (experiment_id, step_order) + on conflict do nothing, para no duplicar
-- si ya existen pasos (p.ej. editados por un admin).

insert into experiment_steps (experiment_id, step_order, title, description, points)
select e.id, 1, 'Separar residuos',
       'Separa los residuos de la actividad en sus contenedores correctos.', 5
from experiments e
on conflict (experiment_id, step_order) do nothing;

insert into experiment_steps (experiment_id, step_order, title, description, points)
select e.id, 2, 'Registrar resultados',
       'Anota en tu bitacora lo que separaste y lo que aprendiste.', 5
from experiments e
on conflict (experiment_id, step_order) do nothing;

insert into experiment_steps (experiment_id, step_order, title, description, points)
select e.id, 3, 'Subir evidencia',
       'Toma una foto del resultado (sin que aparezcan rostros) y subela.', 5
from experiments e
on conflict (experiment_id, step_order) do nothing;

-- Nuevas insignias de alumno/grupo coherentes con pasos y juegos.
insert into badges (code, name, description, icon, points_threshold)
values
  ('explorador_pasos', 'Explorador de Pasos', 'Completa todos los pasos de un reto', 'footprints', 20),
  ('campeon_juego', 'Campeon del Juego', 'Completa el mini-juego de un reto', 'gamepad-2', 15)
on conflict (code) do nothing;
