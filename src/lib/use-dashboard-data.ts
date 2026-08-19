import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type {
  CourseWithDetails,
  LessonWithSection,
  UserLessonProgressRow,
  AchievementWithUnlocked,
  DailyChallengeRow,
  SkillRow,
} from '@/lib/db-types';

export interface DashboardData {
  skills: SkillRow[];
  courses: CourseWithDetails[];
  continueCourse: CourseWithDetails | null;
  continueLessons: LessonWithSection[];
  progress: UserLessonProgressRow[];
  achievements: AchievementWithUnlocked[];
  dailyChallenge: DailyChallengeRow | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(): DashboardData {
  const { user, stats } = useAuth();
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [continueCourse, setContinueCourse] = useState<CourseWithDetails | null>(null);
  const [continueLessons, setContinueLessons] = useState<LessonWithSection[]>([]);
  const [progress, setProgress] = useState<UserLessonProgressRow[]>([]);
  const [achievements, setAchievements] = useState<AchievementWithUnlocked[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    async function load() {
      try {
        // Fetch skills, courses (with skill + sections), achievements, today's challenge, and user progress — in parallel
        const [skillsRes, coursesRes, achievementsRes, challengeRes, progressRes] = await Promise.all([
          supabase.from('skills').select('*').order('name'),
          supabase
            .from('courses')
            .select('*, skill:skills(id, name, icon), course_sections(*)')
            .eq('published', true)
            .order('created_at'),
          supabase
            .from('achievements')
            .select('*, user_achievements!inner(achievement_id, unlocked_at)')
            .order('created_at'),
          supabase
            .from('daily_challenges')
            .select('*')
            .eq('active_date', new Date().toISOString().split('T')[0])
            .maybeSingle(),
          supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user!.id),
        ]);

        if (!active) return;

        if (skillsRes.error) throw skillsRes.error;
        if (coursesRes.error) throw coursesRes.error;

        setSkills(skillsRes.data as SkillRow[]);
        setCourses(coursesRes.data as CourseWithDetails[]);
        setProgress((progressRes.data ?? []) as UserLessonProgressRow[]);
        setDailyChallenge(challengeRes.data as DailyChallengeRow | null);

        // Achievements — need to fetch with left join since inner might miss locked ones
        // Re-fetch achievements without inner join
        const achievementsAllRes = await supabase
          .from('achievements')
          .select('*, user_achievements(achievement_id, unlocked_at)')
          .order('created_at');

        if (!active) return;
        if (achievementsAllRes.error) throw achievementsAllRes.error;
        setAchievements(achievementsAllRes.data as AchievementWithUnlocked[]);

        // Determine "continue learning" course — pick the first course where the user has
        // at least one completed lesson, or the first course if none started yet
        const allCourses = coursesRes.data as CourseWithDetails[];
        const startedCourse = allCourses.find((c) =>
          progressRes.data?.some((p) => {
            const section = c.course_sections?.find((s) => s.id);
            return p.lesson_id && p.completed;
          })
        );
        const picked = startedCourse ?? allCourses[0] ?? null;

        setContinueCourse(picked);

        // Fetch lessons for the continue course
        if (picked && picked.course_sections?.length) {
          const sectionIds = picked.course_sections.map((s) => s.id);
          const lessonsRes = await supabase
            .from('lessons')
            .select('*, section:course_sections(id, title, position)')
            .in('section_id', sectionIds)
            .eq('published', true)
            .order('section_id')
            .order('position');

          if (!active) return;
          if (lessonsRes.error) throw lessonsRes.error;
          setContinueLessons(lessonsRes.data as LessonWithSection[]);
        } else {
          setContinueLessons([]);
        }

        setError(null);
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [user, stats?.xp, refetchKey]);

  return {
    skills,
    courses,
    continueCourse,
    continueLessons,
    progress,
    achievements,
    dailyChallenge,
    loading,
    error,
    refetch,
  };
}
