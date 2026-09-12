-- =============================================================================
-- EXAMINA — Exam Submission Stored Procedure
-- Run after 01_auth_and_schema.sql
-- =============================================================================

-- Atomically records an exam attempt + all answers + calculates score.
-- Called by the Next.js API route /api/exams/submit
--
-- Usage:
-- select * from submit_exam(
--   'exam-uuid',
--   'student-uuid',
--   '[
--     {"question_id": "uuid1", "selected_option": "B"},
--     {"question_id": "uuid2", "selected_option": "A"}
--   ]'::jsonb
-- );

create or replace function public.submit_exam(
  p_exam_id    uuid,
  p_student_id uuid,
  p_answers    jsonb
)
returns table (
  attempt_id uuid,
  score      int,
  total      int,
  percentage numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt_id uuid;
  v_score      int := 0;
  v_total      int := 0;
  v_pct        numeric;
  v_answer     jsonb;
  v_correct    char(1);
  v_is_correct boolean;
begin
  -- Prevent duplicate submissions
  if exists (
    select 1 from public.exam_attempts
    where exam_id = p_exam_id and student_id = p_student_id
  ) then
    raise exception 'You have already submitted this exam';
  end if;

  -- Score each answer
  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    v_total := v_total + 1;

    -- Look up the correct option for this question
    select correct_option into v_correct
    from public.questions
    where id = (v_answer ->> 'question_id')::uuid;

    v_is_correct := (v_answer ->> 'selected_option') = v_correct;

    if v_is_correct then
      v_score := v_score + 1;
    end if;
  end loop;

  -- Calculate percentage
  v_pct := case when v_total > 0 then round((v_score::numeric / v_total) * 100, 2) else 0 end;

  -- Insert attempt
  insert into public.exam_attempts (exam_id, student_id, score, total, percentage)
  values (p_exam_id, p_student_id, v_score, v_total, v_pct)
  returning id into v_attempt_id;

  -- Insert answers
  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    select correct_option into v_correct
    from public.questions
    where id = (v_answer ->> 'question_id')::uuid;

    insert into public.answers (attempt_id, question_id, selected_option, is_correct)
    values (
      v_attempt_id,
      (v_answer ->> 'question_id')::uuid,
      v_answer ->> 'selected_option',
      (v_answer ->> 'selected_option') = v_correct
    );
  end loop;

  return query select v_attempt_id, v_score, v_total, v_pct;
end;
$$;
