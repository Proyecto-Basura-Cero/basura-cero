-- Core tables
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  level text default 'primary',
  active_cycle text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  email text not null unique,
  role text not null check (role in ('admin','teacher','group','jury')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  school_id uuid not null references schools(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  teacher_id uuid references teachers(id) on delete set null,
  name text not null,
  grade text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  week_number int not null unique check (week_number between 1 and 52),
  title text not null,
  objective text not null,
  instructions text not null,
  materials text,
  printable_url text,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  experiment_id uuid not null references experiments(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (end_date >= start_date)
);

create unique index if not exists weekly_challenges_one_current_idx
on weekly_challenges (school_id)
where is_current = true;

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references weekly_challenges(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  submitted_by uuid not null references users(id) on delete restrict,
  comments text,
  participants_count int not null check (participants_count >= 0),
  status text not null default 'submitted' check (status in ('draft','submitted','approved','rejected')),
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(challenge_id, group_id)
);

create table if not exists evidence_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists impact_metrics (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  kg_separated numeric(10,2) default 0,
  reused_items int default 0,
  waste_reduced_estimate numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade unique,
  points_total int not null default 0,
  breakdown_json jsonb not null default '{}'::jsonb,
  calculated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text,
  points_threshold int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists group_badges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  source_submission_id uuid references submissions(id) on delete set null,
  awarded_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(group_id, badge_id)
);

create index if not exists groups_school_idx on groups(school_id);
create index if not exists submissions_group_idx on submissions(group_id);
create index if not exists submissions_challenge_idx on submissions(challenge_id);
create index if not exists evidence_submission_idx on evidence_files(submission_id);
create index if not exists metrics_submission_idx on impact_metrics(submission_id);
