-- ============================================================
-- MIGRATION: Sessions, Terms, Subject Groups, schema updates
-- Run AFTER 01_schema.sql
-- ============================================================

-- Subject groups (e.g. Nursery, Primary, Secondary)
create table if not exists subject_groups (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Add group to subjects (nullable)
alter table subjects add column if not exists group_id uuid references subject_groups(id) on delete set null;

-- Academic sessions
create table if not exists academic_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,           -- e.g. "2024/2025"
  is_active boolean default false,
  closed_at timestamptz,        -- set when closed; once set cannot reopen
  created_at timestamptz default now()
);

-- Terms (belong to a session)
create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references academic_sessions(id) on delete cascade,
  name text not null,           -- e.g. "First Term"
  is_active boolean default false,
  closed_at timestamptz,
  created_at timestamptz default now()
);

-- Enforce 1 class per student
alter table enrollments drop constraint if exists enrollments_student_id_key;
alter table enrollments add constraint enrollments_student_id_unique unique (student_id);

-- Add session + term to exams
alter table exams add column if not exists session_id uuid references academic_sessions(id) on delete set null;
alter table exams add column if not exists term_id uuid references terms(id) on delete set null;

-- Add session + term to results
alter table results add column if not exists session_id uuid references academic_sessions(id) on delete set null;
alter table results add column if not exists term_id uuid references terms(id) on delete set null;

-- ── RLS ─────────────────────────────────────────────────────

alter table subject_groups enable row level security;
alter table academic_sessions enable row level security;
alter table terms enable row level security;

-- Drop old policies for these tables if re-running
drop policy if exists "all read subject_groups" on subject_groups;
drop policy if exists "admin manage subject_groups" on subject_groups;
drop policy if exists "all read academic_sessions" on academic_sessions;
drop policy if exists "admin manage academic_sessions" on academic_sessions;
drop policy if exists "all read terms" on terms;
drop policy if exists "admin manage terms" on terms;

-- SUBJECT_GROUPS
create policy "all read subject_groups"    on subject_groups for select using (auth.uid() is not null);
create policy "admin manage subject_groups" on subject_groups for all   using (get_my_role() = 'admin');

-- ACADEMIC_SESSIONS
create policy "all read academic_sessions"    on academic_sessions for select using (auth.uid() is not null);
create policy "admin manage academic_sessions" on academic_sessions for all   using (get_my_role() = 'admin');

-- TERMS
create policy "all read terms"    on terms for select using (auth.uid() is not null);
create policy "admin manage terms" on terms for all   using (get_my_role() = 'admin');
