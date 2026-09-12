-- ============================================================
-- EXAMINA SCHEMA — run this in Supabase SQL editor
-- If re-running, use the DROP section at the bottom first
-- ============================================================

create extension if not exists citext;

-- Enums
do $$ begin
  create type user_role as enum ('admin', 'teacher', 'student', 'parent');
exception when duplicate_object then null; end $$;

-- ── Tables ──────────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  role user_role not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Many teachers per class
create table if not exists class_teachers (
  class_id uuid not null references classes(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  primary key (class_id, teacher_id)
);

-- Subjects assigned to a class
create table if not exists class_subjects (
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  primary key (class_id, subject_id)
);

-- Student enrollment
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  unique(student_id, class_id)
);

-- Parent-student link
create table if not exists parent_students (
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- Exams
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  scheduled_at timestamptz,
  created_at timestamptz default now()
);

-- Questions (per exam, created by teacher)
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  body text not null,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_option char(1) check (correct_option in ('a','b','c','d')),
  marks numeric(5,2) default 1,
  created_at timestamptz default now()
);

-- Results
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score numeric(5,2),
  remarks text,
  created_at timestamptz default now(),
  unique(exam_id, student_id)
);

-- ── RLS ─────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table subjects enable row level security;
alter table classes enable row level security;
alter table class_teachers enable row level security;
alter table class_subjects enable row level security;
alter table enrollments enable row level security;
alter table parent_students enable row level security;
alter table exams enable row level security;
alter table questions enable row level security;
alter table results enable row level security;

-- Helper: avoids recursive RLS
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Drop old policies before recreating
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- PROFILES
create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "admin profiles"     on profiles for all    using (get_my_role() = 'admin');

-- SUBJECTS
create policy "all read subjects"   on subjects for select using (auth.uid() is not null);
create policy "admin manage subjects" on subjects for all  using (get_my_role() = 'admin');

-- CLASSES
create policy "all read classes"    on classes for select using (auth.uid() is not null);
create policy "admin manage classes" on classes for all   using (get_my_role() = 'admin');

-- CLASS_TEACHERS
create policy "all read class_teachers"    on class_teachers for select using (auth.uid() is not null);
create policy "admin manage class_teachers" on class_teachers for all   using (get_my_role() = 'admin');

-- CLASS_SUBJECTS
create policy "all read class_subjects"    on class_subjects for select using (auth.uid() is not null);
create policy "admin manage class_subjects" on class_subjects for all   using (get_my_role() = 'admin');

-- ENROLLMENTS
create policy "admin manage enrollments"  on enrollments for all    using (get_my_role() = 'admin');
create policy "student own enrollments"   on enrollments for select using (student_id = auth.uid());
create policy "teacher class enrollments" on enrollments for select using (
  exists (select 1 from class_teachers where class_id = enrollments.class_id and teacher_id = auth.uid())
);

-- PARENT_STUDENTS
create policy "admin manage parent_students" on parent_students for all    using (get_my_role() = 'admin');
create policy "parent own links"             on parent_students for select using (parent_id = auth.uid());

-- EXAMS
create policy "admin manage exams"   on exams for all    using (get_my_role() = 'admin');
create policy "teacher own exams"    on exams for all    using (created_by = auth.uid());
create policy "student read exams"   on exams for select using (
  exists (select 1 from enrollments where class_id = exams.class_id and student_id = auth.uid())
);
create policy "parent read exams"    on exams for select using (
  exists (
    select 1 from parent_students ps
    join enrollments e on e.student_id = ps.student_id
    where ps.parent_id = auth.uid() and e.class_id = exams.class_id
  )
);

-- QUESTIONS
create policy "admin manage questions"  on questions for all    using (get_my_role() = 'admin');
create policy "teacher own questions"   on questions for all    using (
  exists (select 1 from exams where id = questions.exam_id and created_by = auth.uid())
);
create policy "student read questions"  on questions for select using (
  exists (
    select 1 from exams ex
    join enrollments en on en.class_id = ex.class_id
    where ex.id = questions.exam_id and en.student_id = auth.uid()
  )
);

-- RESULTS
create policy "admin manage results"   on results for all    using (get_my_role() = 'admin');
create policy "teacher manage results" on results for all    using (
  exists (select 1 from exams where id = results.exam_id and created_by = auth.uid())
);
create policy "student own results"    on results for select using (student_id = auth.uid());
create policy "parent child results"   on results for select using (
  exists (select 1 from parent_students where parent_id = auth.uid() and student_id = results.student_id)
);
