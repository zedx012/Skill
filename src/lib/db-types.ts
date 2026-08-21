// Database row types — mirrors the Supabase schema

export interface SkillRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface CourseRow {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  level: string;
  published: boolean;
  created_at: string;
}

export interface CourseSectionRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
}

export interface LessonRow {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  position: number;
  xp_reward: number;
  gem_reward: number;
  published: boolean;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  selected_skill_id: string | null;
  skill_level: number;
  daily_goal: number;
  created_at: string;
}

export interface UserStatsRow {
  user_id: string;
  xp: number;
  gems: number;
  streak: number;
  hearts: number;
  last_activity_date: string | null;
  created_at: string;
}

export interface UserLessonProgressRow {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  completed_at: string | null;
}

export interface AchievementRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement_type: string | null;
  requirement_value: number | null;
  created_at: string;
}

export interface UserAchievementRow {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface DailyChallengeRow {
  id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  gem_reward: number;
  active_date: string;
  created_at: string;
}

export interface LessonQuestionRow {
  id: string;
  lesson_id: string;
  question: string;
  type: string;
  position: number;
  explanation: string | null;
  created_at: string;
}

export interface LessonOptionRow {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export interface QuestionWithOptions extends LessonQuestionRow {
  lesson_options: LessonOptionRow[];
}

// Composite types for joined queries

export interface CourseWithSkill extends CourseRow {
  skill: Pick<SkillRow, 'id' | 'name' | 'icon'>;
}

export interface LessonWithSection extends LessonRow {
  section: Pick<CourseSectionRow, 'id' | 'title' | 'position'>;
}

export interface CourseWithDetails extends CourseRow {
  skill: Pick<SkillRow, 'id' | 'name' | 'icon'>;
  course_sections: CourseSectionRow[];
}

export interface AchievementWithUnlocked extends AchievementRow {
  user_achievements: UserAchievementRow[];
}
