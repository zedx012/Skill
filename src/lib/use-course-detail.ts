import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { LessonRow, CourseSectionRow, QuestionWithOptions, UserLessonProgressRow } from '@/lib/db-types';

export interface CourseDetailData {
  course: {
    id: string;
    title: string;
    description: string | null;
    level: string;
    skill_id: string;
  } | null;
  skill: { id: string; name: string; icon: string | null } | null;
  sections: CourseSectionRow[];
  lessons: LessonRow[];
  progress: UserLessonProgressRow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCourseDetail(courseId: string): CourseDetailData {
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetailData['course']>(null);
  const [skill, setSkill] = useState<CourseDetailData['skill']>(null);
  const [sections, setSections] = useState<CourseSectionRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<UserLessonProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    if (!user || !courseId) return;
    let active = true;
    setLoading(true);

    async function load() {
      try {
        const [courseRes, progressRes] = await Promise.all([
          supabase
            .from('courses')
            .select('id, title, description, level, skill_id, skill:skills(id, name, icon)')
            .eq('id', courseId)
            .maybeSingle(),
          supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user!.id),
        ]);

        if (!active) return;
        if (courseRes.error) throw courseRes.error;
        if (progressRes.error) throw progressRes.error;

        const courseData = courseRes.data as any;
        setCourse(courseData ? {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          skill_id: courseData.skill_id,
        } : null);
        setSkill(courseData?.skill ?? null);
        setProgress((progressRes.data ?? []) as UserLessonProgressRow[]);

        const sectionsRes = await supabase
          .from('course_sections')
          .select('*')
          .eq('course_id', courseId)
          .order('position');

        if (!active) return;
        if (sectionsRes.error) throw sectionsRes.error;
        setSections(sectionsRes.data as CourseSectionRow[]);

        if (sectionsRes.data && sectionsRes.data.length > 0) {
          const sectionIds = (sectionsRes.data as CourseSectionRow[]).map((s) => s.id);
          const lessonsRes = await supabase
            .from('lessons')
            .select('*')
            .in('section_id', sectionIds)
            .eq('published', true)
            .order('section_id')
            .order('position');

          if (!active) return;
          if (lessonsRes.error) throw lessonsRes.error;
          setLessons(lessonsRes.data as LessonRow[]);
        }

        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [user, courseId, refetchKey]);

  return { course, skill, sections, lessons, progress, loading, error, refetch };
}

export interface LessonDetailData {
  lesson: LessonRow | null;
  questions: QuestionWithOptions[];
  loading: boolean;
  error: string | null;
}

export function useLessonDetail(lessonId: string): LessonDetailData {
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    let active = true;
    setLoading(true);

    async function load() {
      try {
        const [lessonRes, questionsRes] = await Promise.all([
          supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle(),
          supabase
            .from('lesson_questions')
            .select('*, lesson_options(*)')
            .eq('lesson_id', lessonId)
            .order('position'),
        ]);

        if (!active) return;
        if (lessonRes.error) throw lessonRes.error;
        if (questionsRes.error) throw questionsRes.error;

        const qs = (questionsRes.data ?? []) as QuestionWithOptions[];
        // Sort options by position within each question
        qs.forEach((q) => {
          q.lesson_options.sort((a, b) => a.position - b.position);
        });

        setLesson(lessonRes.data as LessonRow | null);
        setQuestions(qs);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [lessonId]);

  return { lesson, questions, loading, error };
}
