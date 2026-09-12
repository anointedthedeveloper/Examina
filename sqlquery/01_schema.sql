-- NOTE: Supabase Auth email format is: username@examina.internal
-- Example: username "admin" -> email "admin@examina.internal"
-- Create users in Supabase Auth dashboard using this email format, then insert into profiles.

create extension if not exists citext;

-- Roles enum
create type user_role as enum ('admin', 'teacher', 'student', 'parent');

-- Profiles table (linked to Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  role user_role not null,
  full_name text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;

-- Users can read their own profile
create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "admins can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can insert/update any profile
create policy "admins can manage all profiles"
  on profiles for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to auto-create profile on signup (optional, for future use)
create or replace function handle_new_user()
returns trigger as $$
begin
  -- profile is created manually or via admin, not auto
  return new;
end;
$$ language plpgsql security definer;
