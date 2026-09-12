-- =============================================================================
-- EXAMINA — Add username column to profiles
-- Usernames are unique identifiers used for login (e.g. "admin", "jdoe2026")
-- Run after 07_set_admin_role.sql
-- =============================================================================

-- Add username column (nullable at first, we'll backfill)
alter table public.profiles
  add column if not exists username text unique;

-- Create index for fast username lookups
create index if not exists idx_profiles_username on public.profiles(username);

-- Backfill: set username = part before @ in email for existing users
update public.profiles
set username = split_part(email, '@', 1)
where username is null;

-- Set admin username manually (change to whatever you want)
update public.profiles
set username = 'admin'
where email = 'admin@peterharvard.edu';

-- Verify
select id, email, username, full_name, role from public.profiles;
