import { useState, useCallback } from 'react';

export type View =
  | { name: 'dashboard' }
  | { name: 'course'; courseId: string }
  | { name: 'lesson'; lessonId: string; courseId: string }
  | { name: 'lesson-complete'; lessonId: string; courseId: string; score: number; totalQuestions: number };

export function useNavigation() {
  const [view, setView] = useState<View>({ name: 'dashboard' });

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return { view, navigate };
}
