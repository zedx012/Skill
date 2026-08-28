import { useMemo } from 'react';
import { ArrowLeft, Check, Lock, Play, Circle, Layers, Zap, Gem, BookOpen } from 'lucide-react';
import type { LessonRow, CourseSectionRow, UserLessonProgressRow } from '@/lib/db-types';
import { pct, padNumber } from '@/lib/format';

interface CourseViewProps {
  course: { id: string; title: string; description: string | null; level: string } | null;
  skill: { id: string; name: string; icon: string | null } | null;
  sections: CourseSectionRow[];
  lessons: LessonRow[];
  progress: UserLessonProgressRow[];
  loading: boolean;
  onBack: () => void;
  onLessonClick: (lessonId: string) => void;
}

export function CourseView({
  course, skill, sections, lessons, progress, loading, onBack, onLessonClick,
}: CourseViewProps) {
  const completedLessonIds = useMemo(
    () => new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id)),
    [progress]
  );

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => {
      const sa = sections.find((s) => s.id === a.section_id);
      const sb = sections.find((s) => s.id === b.section_id);
      const sPos = (sa?.position ?? 0) - (sb?.position ?? 0);
      if (sPos !== 0) return sPos;
      return a.position - b.position;
    }),
    [lessons, sections]
  );

  // Build a flat ordered list — a lesson is unlocked if it's first or the previous is completed
  const lessonUnlockMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (let i = 0; i < sortedLessons.length; i++) {
      if (i === 0) {
        map.set(sortedLessons[i].id, true);
      } else {
        map.set(sortedLessons[i].id, completedLessonIds.has(sortedLessons[i - 1].id));
      }
    }
    return map;
  }, [sortedLessons, completedLessonIds]);

  if (loading) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-[52px] hairline-b bg-paper-50" />
        <div className="flex-1 px-6 lg:px-10 py-8 max-w-[900px] w-full mx-auto">
          <div className="h-6 w-32 shimmer-bg rounded animate-shimmer mb-4" />
          <div className="h-8 w-64 shimmer-bg rounded animate-shimmer mb-3" />
          <div className="h-4 w-96 shimmer-bg rounded animate-shimmer mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 shimmer-bg rounded-lg animate-shimmer mb-3" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-8">
        <p className="text-[14px] text-ink-400">Course not found.</p>
        <button onClick={onBack} className="focus-ring mt-4 px-4 py-2 bg-ink-900 text-paper-100 rounded-lg text-[13px] font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const completedCount = sortedLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPct = pct(completedCount, sortedLessons.length);
  const currentLesson = sortedLessons.find((l) => !completedLessonIds.has(l.id));

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Breadcrumb header */}
      <div className="sticky top-0 z-30 bg-paper-100/80 backdrop-blur-md hairline-b">
        <div className="flex items-center gap-3 px-6 lg:px-10 py-3.5 max-w-[900px] w-full mx-auto">
          <button onClick={onBack} className="focus-ring flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-ink-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Dashboard
          </button>
          <span className="text-ink-300 text-xs">/</span>
          <span className="text-[13px] font-medium text-ink-900 truncate">{course.title}</span>
        </div>
      </div>

      <div className="flex-1 px-6 lg:px-10 py-8 max-w-[900px] w-full mx-auto">
        {/* Course header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            {skill && (
              <span className="text-[10px] font-mono uppercase tracking-eyebrow font-medium px-2 py-0.5 rounded bg-blueprint-500/10 text-blueprint-600">
                {skill.name}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-eyebrow text-ink-400">
              {course.level}
            </span>
          </div>
          <h1 className="font-display text-display-md text-ink-900 tracking-tightish mb-2">
            {course.title}
          </h1>
          <p className="text-[14px] text-ink-500 leading-relaxed max-w-2xl mb-5">
            {course.description}
          </p>

          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="eyebrow">Course Progress</span>
              <span className="font-mono text-[12px] text-ink-700 font-medium tabular-nums">
                {padNumber(completedCount)}/{padNumber(sortedLessons.length)} · {progressPct}%
              </span>
            </div>
            <div className="h-1.5 bg-ink-900/8 rounded-full overflow-hidden">
              <div className="h-full bg-blueprint-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Continue button */}
          {currentLesson && (
            <button
              onClick={() => onLessonClick(currentLesson.id)}
              className="focus-ring group mt-5 inline-flex items-center gap-2.5 px-5 py-3 bg-ink-900 text-paper-100 rounded-lg font-medium text-[13px] hover:bg-ink-800 transition-all duration-200 shadow-lifted hover:scale-[1.01] active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-paper-100 text-paper-100" strokeWidth={0} />
              Continue: {currentLesson.title}
            </button>
          )}
        </div>

        {/* Lessons grouped by section */}
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionLessons = sortedLessons.filter((l) => l.section_id === section.id);
            if (sectionLessons.length === 0) return null;

            return (
              <div key={section.id} className="animate-fade-up">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="eyebrow-ink">Section {section.position + 1}</span>
                  <h2 className="font-display text-[17px] font-semibold text-ink-900 tracking-tightish">
                    {section.title}
                  </h2>
                </div>
                {section.description && (
                  <p className="text-[12px] text-ink-400 mb-3">{section.description}</p>
                )}

                <div className="space-y-2">
                  {sectionLessons.map((lesson) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = lessonUnlockMap.get(lesson.id) ?? false;
                    const isCurrent = currentLesson?.id === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => isUnlocked && onLessonClick(lesson.id)}
                        disabled={!isUnlocked}
                        className={`focus-ring w-full flex items-center gap-3.5 px-4 py-3.5 rounded-lg text-left transition-all duration-200 ${
                          isCurrent
                            ? 'bg-blueprint-500/8 border border-blueprint-500/20'
                            : isCompleted
                            ? 'bg-moss-500/5 hover:bg-moss-500/10'
                            : isUnlocked
                            ? 'bg-paper-50 hover:bg-paper-200 border border-ink-900/5'
                            : 'bg-paper-50/50 border border-ink-900/5 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Status icon */}
                        <div className="shrink-0 w-7 h-7 flex items-center justify-center">
                          {isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-moss-500 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-paper-50" strokeWidth={3} />
                            </div>
                          ) : isUnlocked ? (
                            isCurrent ? (
                              <div className="w-6 h-6 rounded-full border-2 border-blueprint-600 flex items-center justify-center">
                                <Play className="w-3 h-3 text-blueprint-600 fill-blueprint-600" strokeWidth={0} />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-ink-900/15 flex items-center justify-center">
                                <Circle className="w-3 h-3 text-ink-300" strokeWidth={1.5} />
                              </div>
                            )
                          ) : (
                            <Lock className="w-4 h-4 text-ink-300" strokeWidth={2} />
                          )}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-[14px] font-medium truncate ${
                            isCompleted ? 'text-ink-500' : isUnlocked ? 'text-ink-900' : 'text-ink-400'
                          }`}>
                            {lesson.title}
                          </div>
                          {lesson.description && (
                            <div className="text-[11px] text-ink-400 truncate mt-0.5">
                              {lesson.description}
                            </div>
                          )}
                        </div>

                        {/* Rewards */}
                        <div className="shrink-0 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-brass-500" strokeWidth={2} />
                            <span className="font-mono text-[11px] text-ink-500 tabular-nums">{lesson.xp_reward}</span>
                          </div>
                          {lesson.gem_reward > 0 && (
                            <div className="flex items-center gap-1">
                              <Gem className="w-3 h-3 text-blueprint-500" strokeWidth={2} />
                              <span className="font-mono text-[11px] text-ink-500 tabular-nums">{lesson.gem_reward}</span>
                            </div>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-mono uppercase tracking-eyebrow text-moss-600 font-medium bg-moss-500/10 px-1.5 py-0.5 rounded">
                              Done
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-mono uppercase tracking-eyebrow text-blueprint-600 font-medium bg-blueprint-500/10 px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {sortedLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-ink-400">No lessons available yet.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="hairline pt-5 pb-2 mt-10 flex items-center justify-between">
          <span className="text-[11px] text-ink-400 font-mono">
            <Layers className="w-3 h-3 inline mr-1" strokeWidth={2} />
            {completedCount}/{sortedLessons.length} lessons completed
          </span>
        </footer>
      </div>
    </div>
  );
}
