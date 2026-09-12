-- =============================================================================
-- EXAMINA — Peter Harvard International Schools
-- Auth, Schema, RLS Policies & Admin User Management
-- Run this entire file in your Supabase SQL Editor (in order)
-- =============================================================================


-- =============================================================================
-- STEP 1: PROFILES TABLE
-- Extends Supabase auth.users. One row per user.
-- =============================================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null,
  role          text not null default 'student'
                  check (role in ('admin', 'teacher', 'student', 'parent')),
  class_id      uuid,                        -- for students: their class
  parent_email  text,                        -- for students: parent's email
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index for fast lookups by role and email
create index if not exists idx_profiles_role  on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);


-- =============================================================================
-- STEP 2: CLASSES TABLE
-- =============================================================================

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  teacher_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);


-- =============================================================================
-- STEP 3: SUBJECTS TABLE
-- =============================================================================

create table if not exists public.subjects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  class_id   uuid not null references public.classes(id) on delete cascade,
  created_at timestamptz default now()
);


-- =============================================================================
-- STEP 4: QUESTIONS TABLE
-- =============================================================================

create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  text           text not null,
  option_a       text not null,
  option_b       text not null,
  option_c       text not null,
  option_d       text not null,
  correct_option char(1) not null check (correct_option in ('A','B','C','D')),
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz default now()
);


-- =============================================================================
-- STEP 5: EXAMS TABLE
-- =============================================================================

create table if not exists public.exams (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  subject_id       uuid not null references public.subjects(id) on delete cascade,
  class_id         uuid not null references public.classes(id) on delete cascade,
  duration_minutes int  not null default 30,
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz default now()
);


-- =============================================================================
-- STEP 6: EXAM QUESTIONS (join table)
-- =============================================================================

create table if not exists public.exam_questions (
  exam_id     uuid not null references public.exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  primary key (exam_id, question_id)
);


-- =============================================================================
-- STEP 7: EXAM ATTEMPTS
-- =============================================================================

create table if not exists public.exam_attempts (
  id           uuid primary key default gen_random_uuid(),
  exam_id      uuid not null references public.exams(id) on delete cascade,
  student_id   uuid not null references public.profiles(id) on delete cascade,
  score        int   not null default 0,
  total        int   not null default 0,
  percentage   numeric(5,2) not null default 0,
  submitted_at timestamptz default now(),
  -- Prevent a student from submitting the same exam twice
  unique (exam_id, student_id)
);


-- =============================================================================
-- STEP 8: ANSWERS
-- =============================================================================

create table if not exists public.answers (
  attempt_id      uuid not null references public.exam_attempts(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  selected_option char(1) check (selected_option in ('A','B','C','D')),
  is_correct      boolean not null default false,
  primary key (attempt_id, question_id)
);


-- =============================================================================
-- STEP 9: REPORT CARDS
-- =============================================================================

create table if not exists public.report_cards (
  id           uuid primary key default gen_random_uuid(),
  attempt_id   uuid not null references public.exam_attempts(id) on delete cascade,
  student_id   uuid not null references public.profiles(id) on delete cascade,
  parent_email text not null,
  sent_at      timestamptz default now(),
  unique (attempt_id)   -- one report card per attempt
);


-- =============================================================================
-- STEP 10: AUTO-CREATE PROFILE ON SIGNUP
-- When a user signs up via Supabase Auth, this trigger creates their profile.
-- The role, full_name can be passed as user metadata during sign-up.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if it already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


-- =============================================================================
-- STEP 11: AUTO-UPDATE updated_at ON PROFILES
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();


-- =============================================================================
-- STEP 12: ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables then define policies per role.
-- =============================================================================

alter table public.profiles       enable row level security;
alter table public.classes        enable row level security;
alter table public.subjects       enable row level security;
alter table public.questions      enable row level security;
alter table public.exams          enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts  enable row level security;
alter table public.answers        enable row level security;
alter table public.report_cards   enable row level security;

-- Helper: get current user's role
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;


-- ── PROFILES ────────────────────────────────────────────────────────────────

-- Anyone can read their own profile
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins and teachers can read all profiles
create policy "profiles: read all (admin/teacher)"
  on public.profiles for select
  using (public.current_user_role() in ('admin', 'teacher'));

-- Parents can see profiles of their children
create policy "profiles: parent sees children"
  on public.profiles for select
  using (
    public.current_user_role() = 'parent'
    and parent_email = (
      select email from public.profiles where id = auth.uid()
    )
  );

-- Only admins can insert new profiles
create policy "profiles: admin insert"
  on public.profiles for insert
  with check (public.current_user_role() = 'admin');

-- Admins can update any profile; users can update their own
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: admin update all"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- Only admins can delete profiles
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.current_user_role() = 'admin');


-- ── CLASSES ──────────────────────────────────────────────────────────────────

create policy "classes: read (all authenticated)"
  on public.classes for select
  using (auth.role() = 'authenticated');

create policy "classes: write (admin/teacher)"
  on public.classes for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── SUBJECTS ─────────────────────────────────────────────────────────────────

create policy "subjects: read (all authenticated)"
  on public.subjects for select
  using (auth.role() = 'authenticated');

create policy "subjects: write (admin/teacher)"
  on public.subjects for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── QUESTIONS ────────────────────────────────────────────────────────────────

-- Students/parents can read questions only during an active exam (via exam_questions)
create policy "questions: read (admin/teacher)"
  on public.questions for select
  using (public.current_user_role() in ('admin', 'teacher'));

create policy "questions: read (student — in exam)"
  on public.questions for select
  using (
    public.current_user_role() = 'student'
    and exists (
      select 1 from public.exam_questions eq
      join public.exams e on e.id = eq.exam_id
      join public.profiles p on p.id = auth.uid()
      where eq.question_id = questions.id
        and e.class_id = p.class_id
    )
  );

create policy "questions: write (admin/teacher)"
  on public.questions for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── EXAMS ─────────────────────────────────────────────────────────────────────

create policy "exams: read (admin/teacher)"
  on public.exams for select
  using (public.current_user_role() in ('admin', 'teacher'));

create policy "exams: read (student — own class)"
  on public.exams for select
  using (
    public.current_user_role() = 'student'
    and class_id = (
      select class_id from public.profiles where id = auth.uid()
    )
  );

create policy "exams: write (admin/teacher)"
  on public.exams for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── EXAM QUESTIONS ────────────────────────────────────────────────────────────

create policy "exam_questions: read (authenticated)"
  on public.exam_questions for select
  using (auth.role() = 'authenticated');

create policy "exam_questions: write (admin/teacher)"
  on public.exam_questions for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── EXAM ATTEMPTS ─────────────────────────────────────────────────────────────

create policy "attempts: student reads own"
  on public.exam_attempts for select
  using (student_id = auth.uid());

create policy "attempts: admin/teacher reads all"
  on public.exam_attempts for select
  using (public.current_user_role() in ('admin', 'teacher'));

create policy "attempts: student inserts own"
  on public.exam_attempts for insert
  with check (student_id = auth.uid());

-- No updates or deletes by students
create policy "attempts: admin/teacher manage"
  on public.exam_attempts for all
  using (public.current_user_role() in ('admin', 'teacher'));


-- ── ANSWERS ───────────────────────────────────────────────────────────────────

create policy "answers: student reads own"
  on public.answers for select
  using (
    exists (
      select 1 from public.exam_attempts
      where id = answers.attempt_id and student_id = auth.uid()
    )
  );

create policy "answers: admin/teacher reads all"
  on public.answers for select
  using (public.current_user_role() in ('admin', 'teacher'));

create policy "answers: student inserts own"
  on public.answers for insert
  with check (
    exists (
      select 1 from public.exam_attempts
      where id = answers.attempt_id and student_id = auth.uid()
    )
  );


-- ── REPORT CARDS ──────────────────────────────────────────────────────────────

create policy "report_cards: admin/teacher all"
  on public.report_cards for all
  using (public.current_user_role() in ('admin', 'teacher'));

create policy "report_cards: parent reads own"
  on public.report_cards for select
  using (
    parent_email = (
      select email from public.profiles where id = auth.uid()
    )
  );

create policy "report_cards: student reads own"
  on public.report_cards for select
  using (student_id = auth.uid());


-- =============================================================================
-- STEP 13: ADMIN USER MANAGEMENT FUNCTIONS
-- These run with SECURITY DEFINER so the calling admin doesn't need
-- direct access to auth.users. They check the caller is an admin first.
-- =============================================================================

-- ── Create a user (admin only) ────────────────────────────────────────────────
-- Usage: select create_user('John Doe', 'john@school.edu', 'student', 'temp1234', null, null);
create or replace function public.create_user(
  p_full_name   text,
  p_email       text,
  p_role        text,
  p_password    text,
  p_class_id    uuid    default null,
  p_parent_email text   default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Only admins may call this
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can create users';
  end if;

  -- Create the auth user via Supabase internal API
  v_user_id := (
    select id from auth.users
    where email = p_email
    limit 1
  );

  if v_user_id is not null then
    raise exception 'A user with email % already exists', p_email;
  end if;

  -- Use pgcrypto to create auth user
  insert into auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),   -- auto-confirm email (school portal — no email verification needed)
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    'authenticated',
    'authenticated',
    now(),
    now()
  )
  returning id into v_user_id;

  -- Upsert the profile (trigger should handle it, but be explicit)
  insert into public.profiles (id, email, full_name, role, class_id, parent_email)
  values (v_user_id, p_email, p_full_name, p_role, p_class_id, p_parent_email)
  on conflict (id) do update set
    full_name    = excluded.full_name,
    role         = excluded.role,
    class_id     = excluded.class_id,
    parent_email = excluded.parent_email;

  return v_user_id;
end;
$$;


-- ── Reset / change a user's password (admin only) ────────────────────────────
-- Usage: select reset_user_password('user-uuid-here', 'newpassword123');
create or replace function public.reset_user_password(
  p_user_id uuid,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can reset passwords';
  end if;

  update auth.users
  set
    encrypted_password = crypt(p_new_password, gen_salt('bf')),
    updated_at         = now()
  where id = p_user_id;

  if not found then
    raise exception 'User % not found', p_user_id;
  end if;
end;
$$;


-- ── Update a user's profile (admin only) ─────────────────────────────────────
-- Usage: select update_user_profile('user-uuid', 'New Name', 'teacher', null, null);
create or replace function public.update_user_profile(
  p_user_id      uuid,
  p_full_name    text   default null,
  p_role         text   default null,
  p_class_id     uuid   default null,
  p_parent_email text   default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can update user profiles';
  end if;

  update public.profiles
  set
    full_name    = coalesce(p_full_name,    full_name),
    role         = coalesce(p_role,         role),
    class_id     = coalesce(p_class_id,     class_id),
    parent_email = coalesce(p_parent_email, parent_email),
    updated_at   = now()
  where id = p_user_id;

  -- Also update metadata in auth.users
  update auth.users
  set
    raw_user_meta_data = raw_user_meta_data
      || jsonb_build_object(
           'full_name', coalesce(p_full_name, (select full_name from public.profiles where id = p_user_id)),
           'role',      coalesce(p_role,      (select role      from public.profiles where id = p_user_id))
         ),
    updated_at = now()
  where id = p_user_id;
end;
$$;


-- ── Delete a user (admin only) ────────────────────────────────────────────────
-- This deletes from auth.users; cascade removes the profile automatically.
-- Usage: select delete_user('user-uuid-here');
create or replace function public.delete_user(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can delete users';
  end if;

  -- Prevent self-deletion
  if p_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;

  delete from auth.users where id = p_user_id;

  if not found then
    raise exception 'User % not found', p_user_id;
  end if;
end;
$$;


-- ── Bulk create users from a CSV-style insert (admin only) ───────────────────
-- Useful for importing a whole class at once.
-- Example call:
-- select bulk_create_students(
--   'class-uuid-here',
--   'parent@example.com',
--   '[
--     {"full_name": "Alice Smith",  "email": "alice@school.edu",  "password": "pass123"},
--     {"full_name": "Bob Jones",    "email": "bob@school.edu",    "password": "pass456"}
--   ]'::jsonb
-- );
create or replace function public.bulk_create_students(
  p_class_id     uuid,
  p_parent_email text,
  p_students     jsonb
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student  jsonb;
  v_count    int := 0;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'Only admins can bulk-create students';
  end if;

  for v_student in select * from jsonb_array_elements(p_students)
  loop
    perform public.create_user(
      v_student ->> 'full_name',
      v_student ->> 'email',
      'student',
      v_student ->> 'password',
      p_class_id,
      p_parent_email
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;


-- =============================================================================
-- STEP 14: SEED — CREATE YOUR FIRST ADMIN
-- Run this ONCE after your first sign-up through the app,
-- replacing the email with the admin's actual email.
-- =============================================================================

-- Option A: If the admin already signed up, just promote them:
-- update public.profiles
-- set role = 'admin'
-- where email = 'admin@peterharvard.edu';

-- Option B: Create admin directly (useful for initial setup):
-- select public.create_user(
--   'School Administrator',
--   'admin@peterharvard.edu',
--   'admin',
--   'ChangeMe@2026!'
-- );


-- =============================================================================
-- STEP 15: SAMPLE DATA — uncomment to seed demo data
-- =============================================================================

-- -- Insert a class
-- insert into public.classes (id, name) values
--   ('00000000-0000-0000-0000-000000000001', 'JSS 1A'),
--   ('00000000-0000-0000-0000-000000000002', 'JSS 2B');

-- -- Insert a subject
-- insert into public.subjects (id, name, class_id) values
--   ('00000000-0000-0000-0000-000000000010', 'Mathematics',       '00000000-0000-0000-0000-000000000001'),
--   ('00000000-0000-0000-0000-000000000011', 'English Language',  '00000000-0000-0000-0000-000000000001');

-- =============================================================================
-- END OF FILE
-- All tables, triggers, RLS policies and admin functions are ready.
-- Next: run 02_exam_submit_function.sql for the exam submission stored proc.
-- =============================================================================
