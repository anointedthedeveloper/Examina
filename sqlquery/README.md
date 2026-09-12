# Examina — SQL Queries

Run these in order in your **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

| File | What it does | Run when |
|------|-------------|----------|
| `01_auth_and_schema.sql` | Full schema, auth trigger, RLS policies, admin functions | First time setup |
| `02_exam_submit_function.sql` | Exam submission stored procedure | After `01_` |

---

## How to run

1. Go to [https://supabase.com](https://supabase.com) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Paste the contents of the file
5. Click **Run**

---

## What `01_auth_and_schema.sql` covers

- All tables: `profiles`, `classes`, `subjects`, `questions`, `exams`, `exam_questions`, `exam_attempts`, `answers`, `report_cards`
- **Auth trigger** — auto-creates a profile row when a user signs up
- **RLS policies** — row-level security for all 4 roles (admin, teacher, student, parent)
- **Admin functions** (call from SQL Editor or a server-side API):
  - `create_user(full_name, email, role, password, class_id?, parent_email?)` — create any user
  - `reset_user_password(user_id, new_password)` — change a user's password
  - `update_user_profile(user_id, full_name?, role?, class_id?, parent_email?)` — edit profile
  - `delete_user(user_id)` — delete user from auth + cascade to profile
  - `bulk_create_students(class_id, parent_email, [{full_name, email, password}])` — import a whole class

## Creating your first admin

After running `01_`, go to Supabase → **Authentication → Users → Invite user** to create the admin account manually, then run:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@email.com';
```

Or use the `create_user` function directly:

```sql
select public.create_user(
  'School Administrator',
  'admin@peterharvard.edu',
  'admin',
  'ChangeMe@2026!'
);
```
