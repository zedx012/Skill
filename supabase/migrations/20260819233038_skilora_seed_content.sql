/*
# Seed Initial Content Data

## Overview
Inserts a minimal but functional set of content for the Skilora platform:
- 4 skills (Engineering, Data, Design, Strategy)
- 2 courses with sections and lessons (published)
- 6 achievements
- 1 daily challenge for today

## Important Notes
1. Uses ON CONFLICT DO NOTHING to be idempotent — safe to re-run.
2. Content is seeded directly; in production, content management would use
   the service role key, not the anon key.
3. Lesson XP/gem rewards are set to sensible defaults.
*/

-- ============================================================
-- SKILLS
-- ============================================================
INSERT INTO skills (id, name, description, icon) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Engineering', 'System design, architecture, and building resilient software', 'Wrench'),
  ('a0000000-0000-0000-0000-000000000002', 'Data', 'SQL, data modeling, analytics, and visualization', 'Database'),
  ('a0000000-0000-0000-0000-000000000003', 'Design', 'UX, design systems, and interface craft', 'Palette'),
  ('a0000000-0000-0000-0000-000000000004', 'Strategy', 'Prioritization, framing, and product thinking', 'Target')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COURSE 1: System Design for Builders (Engineering, Advanced, Published)
-- ============================================================
INSERT INTO courses (id, skill_id, title, description, level, published) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'System Design for Builders',
   'From single-server sketches to distributed architectures',
   'Advanced', true)
ON CONFLICT (id) DO NOTHING;

-- Sections for Course 1
INSERT INTO course_sections (id, course_id, title, description, position) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'Foundations', 'Core concepts of distributed systems', 0),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
   'Scaling Strategies', 'Techniques for handling growth', 1)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Section 1 (Foundations)
INSERT INTO lessons (id, section_id, title, description, position, xp_reward, gem_reward, published) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Read Replicas vs. Caching', 'When to replicate and when to cache', 0, 30, 5, true),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'Sharding Strategies', 'Partitioning data for scale', 1, 35, 5, true),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'Eventual Consistency Patterns', 'Understanding tradeoffs in distributed state', 2, 25, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Section 2 (Scaling Strategies)
INSERT INTO lessons (id, section_id, title, description, position, xp_reward, gem_reward, published) VALUES
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
   'The CAP Theorem in Practice', 'Consistency, availability, and partition tolerance', 0, 40, 8, true),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002',
   'Distributed Locks & Quorums', 'Coordinating access in distributed systems', 1, 30, 5, true),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002',
   'Design Review: URL Shortener', 'Apply everything to a classic design problem', 2, 50, 10, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COURSE 2: SQL Modeling Mastery (Data, Intermediate, Published)
-- ============================================================
INSERT INTO courses (id, skill_id, title, description, level, published) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
   'SQL Modeling Mastery',
   'Design schemas that scale from prototype to production',
   'Intermediate', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_sections (id, course_id, title, description, position) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
   'Schema Design', 'Normalization and relationships', 0),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
   'Performance', 'Indexes and query optimization', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, section_id, title, description, position, xp_reward, gem_reward, published) VALUES
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003',
   'Normalization Fundamentals', '1NF, 2NF, 3NF and when to break them', 0, 25, 3, true),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003',
   'Foreign Keys & Relationships', 'Modeling one-to-many and many-to-many', 1, 30, 5, true),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004',
   'Indexing Strategies', 'B-tree, GIN, and partial indexes', 0, 35, 5, true),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000004',
   'Window Functions', 'Analytics without subqueries', 1, 40, 8, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
INSERT INTO achievements (id, name, description, icon, requirement_type, requirement_value) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'First Spark', 'Complete your first lesson', 'Zap', 'lessons_completed', 1),
  ('e0000000-0000-0000-0000-000000000002', 'Week One', '7-day streak', 'Flame', 'streak_days', 7),
  ('e0000000-0000-0000-0000-000000000003', 'Deep Diver', 'Complete an Expert-level course', 'Medal', 'expert_courses', 1),
  ('e0000000-0000-0000-0000-000000000004', 'Polymath', 'Study 3 different skill categories', 'Award', 'skills_studied', 3),
  ('e0000000-0000-0000-0000-000000000005', 'Iron Will', '30-day streak', 'Trophy', 'streak_days', 30),
  ('e0000000-0000-0000-0000-000000000006', 'Master Builder', 'Reach Level 20', 'Star', 'level_reached', 20)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DAILY CHALLENGE (today)
-- ============================================================
INSERT INTO daily_challenges (id, title, description, xp_reward, gem_reward, active_date) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Complete 2 lessons', 'Keep the momentum going', 80, 10, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;
