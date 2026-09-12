-- =============================================================================
-- EXAMINA — Final password fix
-- Uses extensions.crypt with explicit schema to avoid search_path issues
-- =============================================================================

update auth.users
set
  encrypted_password = extensions.crypt('Admin2026', extensions.gen_salt('bf')),
  updated_at = now()
where email = 'admin@peterharvard.edu';

-- Confirm it ran
select id, email, left(encrypted_password, 7) as hash_prefix
from auth.users
where email = 'admin@peterharvard.edu';
-- hash_prefix should show: $2a$10 (bcrypt) — that means it worked
