# Examina

> School exam portal by **Anobyte Technologies**

Examina is a web-based exam management portal that lets teachers build question banks and publish exams, students take timed multiple-choice tests, and parents receive automated report cards by email.

---

## Features

- **Role-based access** — Admin, Teacher, and Student roles with a single login
- **Question bank** — Teachers add multiple-choice questions per subject and class
- **Exam builder** — Pick questions, set duration, assign to a class
- **Exam taking** — Students take timed exams with instant results
- **Report cards** — Auto-generated emails to parents with grade, score, and class position
- **Supabase backend** — Postgres database + Auth out of the box
- **Resend email** — Transactional report card delivery

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Resend |

---

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd examina
npm install
```

### 2. Set up environment variables

Copy `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Your verified sender domain |

### 3. Set up the database

Run the SQL below in your Supabase SQL editor:

```sql
-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin','teacher','student')),
  class_id uuid references classes(id),
  parent_email text,
  created_at timestamptz default now()
);

-- Classes
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- Subjects
create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_id uuid references classes(id) on delete cascade,
  created_at timestamptz default now()
);

-- Questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option char(1) not null check (correct_option in ('A','B','C','D')),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Exams
create table exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  duration_minutes int not null default 30,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Exam questions (join)
create table exam_questions (
  exam_id uuid references exams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  primary key (exam_id, question_id)
);

-- Exam attempts
create table exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id),
  student_id uuid references profiles(id),
  score int not null default 0,
  total int not null default 0,
  percentage numeric(5,2) not null default 0,
  submitted_at timestamptz default now()
);

-- Answers
create table answers (
  attempt_id uuid references exam_attempts(id) on delete cascade,
  question_id uuid references questions(id),
  selected_option char(1) not null,
  is_correct boolean not null,
  primary key (attempt_id, question_id)
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── classes/        # Class management
│   │   ├── exams/          # Exam builder
│   │   ├── questions/      # Question bank
│   │   ├── results/        # Results & report cards
│   │   ├── students/       # Student management
│   │   ├── my-exams/       # Student exam list
│   │   └── my-results/     # Student results
│   ├── login/              # Login page
│   └── api/auth/           # Auth API routes
├── components/
│   ├── layout/             # Sidebar, nav
│   └── ui/                 # Button, Input, Card, Badge
└── lib/
    ├── supabase/           # Client, server, middleware helpers
    ├── resend.ts           # Email report cards
    └── types.ts            # Shared TypeScript types
```

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access — classes, questions, exams, results, students |
| **Teacher** | Create/manage questions, exams, view results for their class |
| **Student** | Take exams assigned to their class, view own results |

---

## Report Cards

When a teacher sends a report card from the Results page, Examina automatically emails the student's parent with:

- Student name and class
- Exam title and subject
- Score and percentage
- Letter grade (A+ → F)
- Position in class

---

*Built with ❤️ by Anobyte Technologies*
