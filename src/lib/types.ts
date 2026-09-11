export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  class_id?: string | null
  parent_email?: string | null
  created_at: string
}

export interface Class {
  id: string
  name: string
  teacher_id: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  class_id: string
  created_at: string
}

export interface Question {
  id: string
  subject_id: string
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  created_by: string
  created_at: string
}

export interface Exam {
  id: string
  title: string
  subject_id: string
  class_id: string
  duration_minutes: number
  created_by: string
  created_at: string
}

export interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  score: number
  total: number
  percentage: number
  submitted_at: string
}
