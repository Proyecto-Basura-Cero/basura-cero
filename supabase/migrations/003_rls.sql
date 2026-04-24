-- Row Level Security
alter table schools enable row level security;
alter table users enable row level security;
alter table teachers enable row level security;
alter table groups enable row level security;
alter table experiments enable row level security;
alter table weekly_challenges enable row level security;
alter table submissions enable row level security;
alter table evidence_files enable row level security;
alter table impact_metrics enable row level security;
alter table scores enable row level security;
alter table badges enable row level security;
alter table group_badges enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role'), 'anonymous');
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.current_school_id()
returns uuid
language sql
stable
as $$
  select school_id from users where id = auth.uid();
$$;

create policy schools_read on schools
for select
using (
  id = public.current_school_id() or public.current_role() = 'admin'
);

create policy experiments_public_read on experiments
for select
using (status = 'published' or public.current_role() = 'admin');

create policy weekly_challenges_school_read on weekly_challenges
for select
using (school_id = public.current_school_id() or public.current_role() = 'admin' or public.current_role() = 'jury');

create policy groups_school_rw on groups
for all
using (
  school_id = public.current_school_id() or public.current_role() = 'admin'
)
with check (
  school_id = public.current_school_id() or public.current_role() = 'admin'
);

create policy submissions_access on submissions
for all
using (
  exists (
    select 1 from groups g
    where g.id = submissions.group_id
    and (g.school_id = public.current_school_id() or public.current_role() in ('admin','jury'))
  )
)
with check (
  exists (
    select 1 from groups g
    where g.id = submissions.group_id
    and (g.school_id = public.current_school_id() or public.current_role() = 'admin')
  )
);

create policy files_access on evidence_files
for all
using (
  exists (
    select 1 from submissions s
    join groups g on g.id = s.group_id
    where s.id = evidence_files.submission_id
    and (g.school_id = public.current_school_id() or public.current_role() in ('admin','jury'))
  )
)
with check (
  exists (
    select 1 from submissions s
    join groups g on g.id = s.group_id
    where s.id = evidence_files.submission_id
    and (g.school_id = public.current_school_id() or public.current_role() = 'admin')
  )
);

create policy metrics_access on impact_metrics
for all
using (
  exists (
    select 1 from submissions s
    join groups g on g.id = s.group_id
    where s.id = impact_metrics.submission_id
    and (g.school_id = public.current_school_id() or public.current_role() in ('admin','jury'))
  )
)
with check (
  exists (
    select 1 from submissions s
    join groups g on g.id = s.group_id
    where s.id = impact_metrics.submission_id
    and (g.school_id = public.current_school_id() or public.current_role() = 'admin')
  )
);

create policy scores_read on scores
for select
using (
  exists (
    select 1 from submissions s
    join groups g on g.id = s.group_id
    where s.id = scores.submission_id
    and (g.school_id = public.current_school_id() or public.current_role() in ('admin','jury'))
  )
);

create policy badges_read on badges
for select using (true);

create policy group_badges_read on group_badges
for select
using (
  exists (
    select 1 from groups g
    where g.id = group_badges.group_id
    and (g.school_id = public.current_school_id() or public.current_role() in ('admin','jury'))
  )
);
