-- Experimentos por pasos.
--
-- Compatibilidad hacia atras: los experimentos existentes siguen funcionando.
-- Si un experimento no tiene pasos, la UI cae al modo monolitico actual
-- (campo instructions). El seed de pasos (017) es idempotente.

create table if not exists experiment_steps (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  step_order int not null check (step_order >= 1),
  title text not null,
  description text not null,
  points int not null default 0 check (points >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (experiment_id, step_order)
);

create index if not exists experiment_steps_experiment_idx on experiment_steps(experiment_id);

alter table experiment_steps enable row level security;

-- Lectura publica de pasos de experimentos publicados (coherente con experiments_public_read).
create policy experiment_steps_public_read on experiment_steps
for select
using (
  exists (
    select 1 from experiments e
    where e.id = experiment_steps.experiment_id
    and (e.status = 'published' or public.current_role() = 'admin')
  )
);
