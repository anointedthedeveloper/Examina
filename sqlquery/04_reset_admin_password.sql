-- =============================================================================
-- EXAMINA — Reset admin password (run if 400 login error occurs)
-- The direct auth.users insert may not hash correctly via pgcrypto.
-- This uses the extensions schema where pgcrypto is properly loaded.
-- =============================================================================

-- Option A: Reset password for existing user
update auth.users 
set 
  encrypted_password = extensions.crypt('Admin@2026!', extensions.gen_salt('bf')),
  updated_at = now()
where email = 'admin@peterharvard.edu';

-- Verify it updated
select id, email, created_at, email_confirmed_at 
from auth.users 
where email = 'admin@peterharvard.edu';

-- =============================================================================
-- Option B: If the user shows in auth.users but profile is missing, fix that:
-- =============================================================================

-- insert into public.profiles (id, email, full_name, role)
-- select id, email, 'School Administrator', 'admin'
-- from auth.users
-- where email = 'admin@peterharvard.edu'
-- on conflict (id) do update set role = 'admin';
