-- =============================================================================
-- EXAMINA — Fix create_user (pgcrypto approach)
-- Run this in Supabase SQL Editor to fix the gen_salt error
-- =============================================================================

-- STEP 1: Enable pgcrypto extension (needed for crypt + gen_salt)
create extension if not exists pgcrypto;

-- STEP 2: Recreate create_user with pgcrypto available
create or replace function public.create_user(
  p_full_name    text,
  p_email        text,
  p_role         text,
  p_password     text,
  p_class_id     uuid   default null,
  p_parent_email text   default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid;
begin
  -- Check caller is admin (skip on first run when no users exist yet)
  if exists (select 1 from public.profiles limit 1) then
    if public.current_user_role() <> 'admin' then
      raise exception 'Only admins can create users';
    end if;
  end if;

  -- Check email not already taken
  select id into v_user_id from auth.users where email = p_email limit 1;
  if v_user_id is not null then
    raise exception 'A user with email % already exists', p_email;
  end if;

  -- Insert into auth.users using pgcrypto for password hashing
  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    role,
    aud,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    ''
  )
  returning id into v_user_id;

  -- Upsert profile
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


-- STEP 3: Also fix reset_user_password to use pgcrypto
create or replace function public.reset_user_password(
  p_user_id      uuid,
  p_new_password text
)
returns void
language plpgsql
security definer
set search_path = public, extensions
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


-- =============================================================================
-- STEP 4: Create your first admin — run this after the functions above
-- Change the email and password to what you want
-- =============================================================================

select public.create_user(
  'School Administrator',   -- full name
  'admin@peterharvard.edu', -- email (this is the login username)
  'admin',                  -- role
  'Admin@2026!'             -- password
);
