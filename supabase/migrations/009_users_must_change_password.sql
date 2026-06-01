-- Obliga cambio de contrasena en primer ingreso (usuarios creados por admin).
alter table users
add column if not exists must_change_password boolean not null default false;
