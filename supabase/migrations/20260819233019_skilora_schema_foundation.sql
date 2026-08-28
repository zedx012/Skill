/*
# Skilora Schema Foundation

## Overview
Creates the complete database foundation for the Skilora gamified skills-learning platform.
This is a multi-user application with Supabase Auth — each user sees only their own
profile, stats, and progress, while published course content is shared and readable
by all authenticated users.

## New Tables (13 total)

### Public content (shared, read by all authenticated users)
1. `skills` — skill categories (e.g. Engineering, Design, Data)
2. `courses` — courses belonging to a skill
3. `course_sections` — sections within a course (ordered)
4. `lessons` — lessons within a section (ordered, with XP/gem rewards)
5. `lesson_questions` — quiz questions within a lesson
6. `lesson_options` — answer options for a question
7. `achievements` — achievement definitions with requirement metadata
8. `daily_challenges` — date-specific challenges with rewards

### User-owned data (private, visible only to the owning user)
9. `profiles` — user profile, linked to auth.users
10. `user_stats` — XP, gems, streak, hearts, last activity
11. `user_lesson_progress` — per-lesson completion tracking
12. `user_achievements` — unlocked achievements per user

## Relationships
- profiles.id → auth.users.id (1:1)
- courses.skill_id → skills.id
- course_sections.course_id → courses.id
- lessons.section_id → course_sections.id
- lesson_questions.lesson_id → lessons.id
- lesson_options.question_id → lesson_questions.id
- profiles.selected_skill_id → skills.id (nullable)
- user_stats.user_id → auth.users.id (1:1)
- user_lesson_progress.(user_id, lesson_id) → composite key referencing auth.users + lessons
- user_achievements.(user_id, achievement_id) → composite key

## Security (RLS)
- All tables have RLS enabled.
- Published course content (skills, courses, sections, lessons, questions, options,
  achievements, daily_challenges): SELECT open to authenticated users.
  Writes restricted — content is managed via service role, not the frontend.
- User-owned tables (profiles, user_stats, user_lesson_progress, user_achievements):
  Users can SELECT/INSERT/UPDATE only their own rows (auth.uid() = user_id).
  No user can read another user's private data.

## Important Notes
1. Owner columns default to `auth.uid()` so client-side inserts that omit the
   user_id still satisfy RLS WITH CHECK.
2. Foreign keys use ON DELETE CASCADE for owned data so deleting a user cleans up.
3. Content tables use ON DELETE CASCADE for parent→child relationships.
4. Indexes added on frequently queried columns (foreign keys, published flags, dates).
5. A `handle_new_user` trigger function creates a profile + user_stats row
   automatically when a new auth user registers.
*/

-- ============================================================
-- CONTENT TABLES (shared, read by all authenticated users)
-- ============================================================

-- Skills: top-level skill categories
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Courses: belong to a skill
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  level text NOT NULL DEFAULT 'Foundations',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_skill_id ON courses(skill_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);

-- Course sections: ordered sections within a course
CREATE TABLE IF NOT EXISTS course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);

-- Lessons: ordered lessons within a section
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 10,
  gem_reward integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(published);

-- Lesson questions: quiz questions within a lesson
CREATE TABLE IF NOT EXISTS lesson_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL DEFAULT 'multiple_choice',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_questions_lesson_id ON lesson_questions(lesson_id);

-- Lesson options: answer options for a question
CREATE TABLE IF NOT EXISTS lesson_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES lesson_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lesson_options_question_id ON lesson_options(question_id);

-- Achievements: definitions with requirement metadata
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  requirement_type text,
  requirement_value integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily challenges: date-specific challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 0,
  gem_reward integer NOT NULL DEFAULT 0,
  active_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_active_date ON daily_challenges(active_date);

-- ============================================================
-- USER-OWNED TABLES (private, visible only to owner)
-- ============================================================

-- Profiles: 1:1 with auth.users, created automatically on signup
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  selected_skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  skill_level integer NOT NULL DEFAULT 1,
  daily_goal integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_selected_skill_id ON profiles(selected_skill_id);

-- User stats: 1:1 with auth.users, gamification state
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  gems integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  hearts integer NOT NULL DEFAULT 5,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User lesson progress: tracks completion per lesson per user
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  score integer,
  completed_at timestamptz,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);

-- User achievements: unlocked achievements per user
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: Content tables (read-only for authenticated users)
-- ============================================================

-- Skills: readable by authenticated
DROP POLICY IF EXISTS "authenticated_read_skills" ON skills;
CREATE POLICY "authenticated_read_skills"
  ON skills FOR SELECT TO authenticated USING (true);

-- Courses: only published courses readable by authenticated
DROP POLICY IF EXISTS "authenticated_read_courses" ON courses;
CREATE POLICY "authenticated_read_courses"
  ON courses FOR SELECT TO authenticated USING (published = true);

-- Course sections: readable if parent course is published
DROP POLICY IF EXISTS "authenticated_read_course_sections" ON course_sections;
CREATE POLICY "authenticated_read_course_sections"
  ON course_sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND courses.published = true));

-- Lessons: readable if parent course (via section) is published
DROP POLICY IF EXISTS "authenticated_read_lessons" ON lessons;
CREATE POLICY "authenticated_read_lessons"
  ON lessons FOR SELECT TO authenticated
  USING (
    lessons.published = true
    AND EXISTS (
      SELECT 1 FROM course_sections
      JOIN courses ON courses.id = course_sections.course_id
      WHERE course_sections.id = lessons.section_id
      AND courses.published = true
    )
  );

-- Lesson questions: readable if parent lesson is published
DROP POLICY IF EXISTS "authenticated_read_lesson_questions" ON lesson_questions;
CREATE POLICY "authenticated_read_lesson_questions"
  ON lesson_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM lessons WHERE lessons.id = lesson_questions.lesson_id AND lessons.published = true));

-- Lesson options: readable if parent question's lesson is published
DROP POLICY IF EXISTS "authenticated_read_lesson_options" ON lesson_options;
CREATE POLICY "authenticated_read_lesson_options"
  ON lesson_options FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lesson_questions
      JOIN lessons ON lessons.id = lesson_questions.lesson_id
      WHERE lesson_questions.id = lesson_options.question_id
      AND lessons.published = true
    )
  );

-- Achievements: readable by authenticated
DROP POLICY IF EXISTS "authenticated_read_achievements" ON achievements;
CREATE POLICY "authenticated_read_achievements"
  ON achievements FOR SELECT TO authenticated USING (true);

-- Daily challenges: readable by authenticated (active or upcoming)
DROP POLICY IF EXISTS "authenticated_read_daily_challenges" ON daily_challenges;
CREATE POLICY "authenticated_read_daily_challenges"
  ON daily_challenges FOR SELECT TO authenticated USING (true);

-- ============================================================
-- POLICIES: User-owned tables (owner-scoped CRUD)
-- ============================================================

-- Profiles: user can read/update only their own
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User stats: user can read/update only their own
DROP POLICY IF EXISTS "read_own_stats" ON user_stats;
CREATE POLICY "read_own_stats"
  ON user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_stats" ON user_stats;
CREATE POLICY "insert_own_stats"
  ON user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_stats" ON user_stats;
CREATE POLICY "update_own_stats"
  ON user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User lesson progress: user can CRUD only their own
DROP POLICY IF EXISTS "read_own_progress" ON user_lesson_progress;
CREATE POLICY "read_own_progress"
  ON user_lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON user_lesson_progress;
CREATE POLICY "insert_own_progress"
  ON user_lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON user_lesson_progress;
CREATE POLICY "update_own_progress"
  ON user_lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON user_lesson_progress;
CREATE POLICY "delete_own_progress"
  ON user_lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User achievements: user can read/insert only their own
DROP POLICY IF EXISTS "read_own_user_achievements" ON user_achievements;
CREATE POLICY "read_own_user_achievements"
  ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_achievements" ON user_achievements;
CREATE POLICY "insert_own_user_achievements"
  ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_achievements" ON user_achievements;
CREATE POLICY "delete_own_user_achievements"
  ON user_achievements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile + user_stats on signup
-- ============================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with username from email
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  -- Create user_stats with sensible defaults
  INSERT INTO public.user_stats (user_id, xp, gems, streak, hearts)
  VALUES (NEW.id, 0, 0, 0, 5);

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant execute on the trigger function to the supabase_admin role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_admin;
