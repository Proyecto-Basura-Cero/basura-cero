-- Seed badges
insert into badges (code, name, description, icon, points_threshold)
values
('guardian_reciclaje', 'Guardian del Reciclaje', 'Completa 3 semanas con evidencia', 'shield-check', 150),
('super_separador', 'Super Separador', 'Acumula al menos 15kg separados', 'recycle', 200),
('heroe_cero_basura', 'Heroe Cero Basura', 'Constancia en retos semanales', 'award', 300),
('equipo_compostero', 'Equipo Compostero', 'Participacion destacada en compostaje', 'leaf', 250),
('aula_verde', 'Aula Verde', 'Participacion promedio alta', 'school', 220),
('reto_cumplido', 'Reto Cumplido', 'Entrega semanal a tiempo', 'check-circle', 30),
('impacto_dorado', 'Impacto Dorado', 'Top 3 mensual', 'trophy', 350),
('grupo_eco_lider', 'Grupo Eco-Lider', 'Top 1 trimestral', 'crown', 500)
on conflict (code) do nothing;

-- Seed 52 experiments
insert into experiments (week_number, title, objective, instructions, materials, printable_url, status)
select
  w,
  'Experimento Semana ' || w,
  'Reducir y separar residuos en la semana ' || w,
  '1) Separar residuos. 2) Registrar resultados. 3) Subir evidencia.',
  'Botes etiquetados, guantes, bitacora',
  'https://basuracero.school/fichas/semana-' || w || '.pdf',
  'published'
from generate_series(1, 52) as w
on conflict (week_number) do nothing;
