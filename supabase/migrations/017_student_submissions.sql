-- Evidencia por alumno (se consolida en el grupo).
--
-- Reutiliza el patron de submissions/evidence_files pero por alumno.
-- group_id se desnormaliza para facilitar la agregacion y el orden.
-- Archivos en el bucket privado 'evidencias' con path:
--   schoolId/groupId/studentId/challengeId/...  (solo IDs, sin alias/PII).
-- Validacion (approve/reject) la hace el maestro/admin server-side.

create table if not exists student_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references weekly_challenges(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  comments text,
  status text not null default 'submitted' check (status in ('draft','submitted','approved','rejected')),
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (challenge_id, student_id)
);

create table if not exists student_evidence_files (
  id uuid primary key default gen_random_uuid(),
  student_submission_id uuid not null references student_submissions(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists student_submissions_student_idx on student_submissions(student_id);
create index if not exists student_submissions_group_idx on student_submissions(group_id);
create index if not exists student_submissions_challenge_idx on student_submissions(challenge_id);
create index if not exists student_evidence_files_submission_idx on student_evidence_files(student_submission_id);

alter table student_submissions enable row level security;
alter table student_evidence_files enable row level security;
