-- Alumnos individuales (sin cuenta de Supabase Auth) y codigos de acceso.
--
-- Privacidad de menores (requisito duro):
--   * Solo se almacena un alias NO identificable, el grado opcional y el grupo.
--   * NUNCA nombre real, apellidos, correo, telefono, fecha de nacimiento ni fotos de rostro.
--   * El codigo de acceso se guarda HASHEADO (code_hash); jamas en claro.
--
-- Acceso: los alumnos no son users de auth. Toda lectura/escritura ocurre en el
-- servidor con el service role tras validar el codigo. La RLS queda deny-by-default
-- para clientes anon (no se define ninguna policy permisiva).

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  alias text not null,
  grade text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (group_id, alias)
);

create table if not exists student_access_codes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  code_hash text not null,
  code_prefix text not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists students_group_idx on students(group_id);
create index if not exists students_school_idx on students(school_id);
create index if not exists student_access_codes_student_idx on student_access_codes(student_id);

-- Un unico codigo activo por alumno.
create unique index if not exists student_access_codes_one_active_idx
on student_access_codes (student_id)
where is_active = true;

-- RLS: habilitada sin policies permisivas => denegado para clientes anon.
-- El acceso real pasa por route handlers con createServerSupabase() (service role).
alter table students enable row level security;
alter table student_access_codes enable row level security;
