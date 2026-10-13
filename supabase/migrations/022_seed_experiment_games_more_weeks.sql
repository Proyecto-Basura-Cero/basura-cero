-- Amplia los mini-juegos de ejemplo a mas semanas (2..10).
--
-- Mantiene el tipo 'relacionar' (config_json = { "pairs": [{ "left", "right" }] }),
-- que la UI ya soporta. Idempotente: solo inserta si el experimento aun no tiene
-- juego. La Semana 1 se sembro en 020.

-- Semana 2: relaciona material con su contenedor/color
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Cada cosa a su bote',
  '{"pairs":[
     {"left":"Periodico","right":"Papel (azul)"},
     {"left":"Botella PET","right":"Plastico (amarillo)"},
     {"left":"Restos de comida","right":"Organico (verde)"},
     {"left":"Frasco de vidrio","right":"Vidrio (gris)"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 2
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 3: 3R - relaciona accion con su concepto
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Las 3 erres',
  '{"pairs":[
     {"left":"Usar una botella menos","right":"Reducir"},
     {"left":"Convertir un frasco en lapicero","right":"Reusar"},
     {"left":"Llevar el papel al centro de acopio","right":"Reciclar"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 3
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 4: tiempo de degradacion aproximado
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Cuanto tarda en desaparecer',
  '{"pairs":[
     {"left":"Cascara de fruta","right":"Semanas"},
     {"left":"Papel","right":"Meses"},
     {"left":"Lata de aluminio","right":"Decadas"},
     {"left":"Botella de plastico","right":"Cientos de anos"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 4
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 5: compostaje - que si va y que no va a la composta
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Composta si o no',
  '{"pairs":[
     {"left":"Cascara de verdura","right":"Si va a composta"},
     {"left":"Hojas secas","right":"Si va a composta"},
     {"left":"Bolsa de plastico","right":"No va a composta"},
     {"left":"Pila usada","right":"No va a composta"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 5
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 6: ahorro de agua
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Cuidamos el agua',
  '{"pairs":[
     {"left":"Cerrar la llave al lavarte los dientes","right":"Ahorra agua"},
     {"left":"Juntar agua de lluvia para las plantas","right":"Ahorra agua"},
     {"left":"Dejar la manguera abierta","right":"Desperdicia agua"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 6
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 7: ahorro de energia
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Energia inteligente',
  '{"pairs":[
     {"left":"Apagar la luz al salir","right":"Ahorra energia"},
     {"left":"Usar luz natural de dia","right":"Ahorra energia"},
     {"left":"Dejar la tele prendida sin ver","right":"Gasta energia"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 7
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 8: residuos peligrosos vs comunes
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Con cuidado',
  '{"pairs":[
     {"left":"Pila usada","right":"Residuo peligroso"},
     {"left":"Medicina caducada","right":"Residuo peligroso"},
     {"left":"Hoja de papel","right":"Residuo comun"},
     {"left":"Cascara de platano","right":"Residuo comun"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 8
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 9: productos reutilizables vs desechables
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Reutilizable o de un solo uso',
  '{"pairs":[
     {"left":"Botella de metal","right":"Reutilizable"},
     {"left":"Bolsa de tela","right":"Reutilizable"},
     {"left":"Popote de plastico","right":"Un solo uso"},
     {"left":"Vaso desechable","right":"Un solo uso"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 9
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);

-- Semana 10: donde encuentro cada residuo en casa
insert into experiment_games (experiment_id, type, title, config_json, points, is_active)
select e.id, 'relacionar', 'Detective de residuos',
  '{"pairs":[
     {"left":"Cascaras y sobras","right":"Cocina"},
     {"left":"Botellas de shampoo","right":"Bano"},
     {"left":"Hojas y cuadernos","right":"Escritorio"},
     {"left":"Hojas de arbol","right":"Patio"}
   ]}'::jsonb, 15, true
from experiments e
where e.week_number = 10
  and not exists (select 1 from experiment_games g where g.experiment_id = e.id);
