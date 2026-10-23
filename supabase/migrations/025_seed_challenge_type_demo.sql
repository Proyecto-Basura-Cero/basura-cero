-- Seed de demostracion para el calendario de 52 semanas.
--
-- Asigna un tipo de reto (color) a las primeras 12 semanas, ciclando los
-- cuatro tipos, para que el calendario se vea coloreado de inmediato tras
-- aplicar la migracion 024. El resto de semanas queda sin tipo hasta que el
-- admin las configure desde el panel.
--
-- Idempotente: solo asigna tipo donde aun no hay uno (challenge_type is null),
-- para no sobreescribir lo que un admin ya haya configurado.
--
-- Mapeo por posicion (week_number):
--   1,5,9  -> reducir      2,6,10 -> reutilizar
--   3,7,11 -> reciclar     4,8,12 -> reflexionar

update experiments
set challenge_type = case ((week_number - 1) % 4)
  when 0 then 'reducir'
  when 1 then 'reutilizar'
  when 2 then 'reciclar'
  else 'reflexionar'
end
where week_number between 1 and 12
  and challenge_type is null;
