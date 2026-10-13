-- Progreso del alumno: pasos completados y juegos jugados, por reto semanal.
--
-- Se asocia siempre a un weekly_challenge concreto para poder calcular
-- aportes por semana y agregarlos al grupo. Acceso 100% server-side
-- (service role) tras requireStudentSession(); RLS deny-by-default.

create table if not exists student_step_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  step_id uuid not null references experiment_steps(id) on delete cascade,
  challenge_id uuid not null references weekly_challenges(id) on delete cascade,
  completed_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (student_id, step_id, challenge_id)
);

create table if not exists student_game_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  game_id uuid not null references experiment_games(id) on delete cascade,
  challenge_id uuid not null references weekly_challenges(id) on delete cascade,
  score int not null default 0 check (score >= 0),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, game_id, challenge_id)
);

create index if not exists student_step_progress_student_idx on student_step_progress(student_id);
create index if not exists student_step_progress_challenge_idx on student_step_progress(challenge_id);
create index if not exists student_game_progress_student_idx on student_game_progress(student_id);
create index if not exists student_game_progress_challenge_idx on student_game_progress(challenge_id);

alter table student_step_progress enable row level security;
alter table student_game_progress enable row level security;
