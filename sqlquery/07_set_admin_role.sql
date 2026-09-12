-- =============================================================================
-- EXAMINA — Set admin role after creating user via Supabase Dashboard
-- Run AFTER creating the user in Authentication → Users
-- =============================================================================

-- Give the user the admin role
update public.profiles
set role = 'admin',
    full_name = 'School Administrator'
where email = 'admin@peterharvard.cloud';

-- Verify
select id, email, full_name, role from public.profiles
where email = 'admin@peterharvard.cloud';
