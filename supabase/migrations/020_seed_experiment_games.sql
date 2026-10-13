-- Seed de ejemplo de mini-juego "relacionar" para la Semana 1.
--
-- config_json para el tipo 'relacionar':
--   { "pairs": [ { "left": "...", "right": "..." }, ... ] }
-- El resto de experimentos pueden tener su juego cargado por el admin mas
-- adelante; la UI tolera la ausencia de juego.

insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select
  e.id,
  'relacionar',
  'Separa la basura',
  '{"pairs":[
     {"left":"Botella de plastico","right":"Plastico"},
     {"left":"Cascara de platano","right":"Organico"},
     {"left":"Hoja de papel","right":"Papel"},
     {"left":"Lata de refresco","right":"Metal"}
   ]}'::jsonb,
  15,
  true
from experiments e
where e.week_number = 1
  and not exists (
    select 1 from experiment_games g where g.experiment_id = e.id
  );
