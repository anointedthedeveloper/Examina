-- NOTE: Supabase Auth email format is: username@examina.internal
-- Example: username "john" -> email "john@examina.internal"
-- When adding users via app, create auth user first then insert profile.

-- Extensions
create extension if not exists citext;

-- Roles enum
create type user_role as enum ('admin', 'teacher', 'student', 'parent');

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  role user_role not null,
  full_name text,
  created_at timestamptz default now()
);

-- Classes
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Student-class enrollment
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  unique(student_id, class_id)
);

-- Parent-student link
create table parent_students (
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);

-- Exams
create table exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_id uuid references classes(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  scheduled_at timestamptz,
  created_at timestamptz default now()
);

-- Results
create table results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score numeric(5,2),
  remarks text,
  created_at timestamptz default now(),
  unique(exam_id, student_id)
);

-- =====================
-- RLS
-- =====================

alter table profiles enable row level security;
alter table classes enable row level security;
alter table enrollments enable row level security;
alter table parent_students enable row level security;
alter table exams enable row level security;
alter table results enable row level security;

-- Helper function to get current user role (avoids recursion)
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- PROFILES
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "admin full access profiles" on profiles for all using (get_my_role() = 'admin');

-- CLASSES
create policy "admin manage classes" on classes for all using (get_my_role() = 'admin');
create policy "teacher read own classes" on classes for select using (teacher_id = auth.uid());
create policy "student read enrolled classes" on classes for select using (
  exists (select 1 from enrollments where class_id = classes.id and student_id = auth.uid())
);

-- ENROLLMENTS
create policy "admin manage enrollments" on enrollments for all using (get_my_role() = 'admin');
create policy "student read own enrollments" on enrollments for select using (student_id = auth.uid());
create policy "teacher read class enrollments" on enrollments for select using (
  exists (select 1 from classes where id = enrollments.class_id and teacher_id = auth.uid())
);

-- PARENT_STUDENTS
create policy "admin manage parent_students" on parent_students for all using (get_my_role() = 'admin');
create policy "parent read own links" on parent_students for select using (parent_id = auth.uid());

-- EXAMS
create policy "admin manage exams" on exams for all using (get_my_role() = 'admin');
create policy "teacher manage own exams" on exams for all using (created_by = auth.uid());
create policy "student read exams" on exams for select using (
  exists (select 1 from enrollments where class_id = exams.class_id and student_id = auth.uid())
);
create policy "parent read child exams" on exams for select using (
  exists (
    select 1 from parent_students ps
    join enrollments e on e.student_id = ps.student_id
    where ps.parent_id = auth.uid() and e.class_id = exams.class_id
  )
);

-- RESULTS
create policy "admin manage results" on results for all using (get_my_role() = 'admin');
create policy "teacher manage results" on results for all using (
  exists (select 1 from exams where id = results.exam_id and created_by = auth.uid())
);
create policy "student read own results" on results for select using (student_id = auth.uid());
create policy "parent read child results" on results for select using (
  exists (select 1 from parent_students where parent_id = auth.uid() and student_id = results.student_id)
);
