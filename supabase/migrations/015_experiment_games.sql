-- Mini-juegos educativos por experimento.
--
-- Tipos soportados (config_json define el contenido concreto):
--   * relacionar  -> pares { left, right }
--   * clasificar  -> categorias + items a clasificar
--   * arrastrar   -> items a arrastrar hacia zonas destino
--
-- Completar el juego otorga puntos (points) y se registra el desempeno
-- en student_game_progress (016).

create table if not exists experiment_games (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  type text not null check (type in ('relacionar','clasificar','arrastrar')),
  title text not null,
  config_json jsonb not null default '{}'::jsonb,
  points int not null default 0 check (points >= 0),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists experiment_games_experiment_idx on experiment_games(experiment_id);

alter table experiment_games enable row level security;

create policy experiment_games_public_read on experiment_games
for select
using (
  is_active = true
  and exists (
    select 1 from experiments e
    where e.id = experiment_games.experiment_id
    and (e.status = 'published' or public.current_role() = 'admin')
  )
);
