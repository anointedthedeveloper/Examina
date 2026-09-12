-- =============================================================================
-- EXAMINA — Clean broken users and recreate admin properly
-- Run this in Supabase SQL Editor
-- =============================================================================

-- STEP 1: Delete the broken admin user (cascade removes profile too)
delete from auth.users where email = 'admin@peterharvard.edu';

-- Confirm it's gone
select count(*) as remaining_users from auth.users;

-- =============================================================================
-- That's it for this file. After running, go to:
-- Supabase Dashboard → Authentication → Users → Add user
-- Email: admin@peterharvard.edu
-- Password: Admin2026
-- Then run 07_set_admin_role.sql to give them the admin role
-- =============================================================================
