import { useState } from 'react';
import {
  Play,
  Zap,
  Check,
  ChevronRight,
  ArrowRight,
  Circle,
  Layers,
} from 'lucide-react';
import type { CourseWithDetails, LessonWithSection, UserLessonProgressRow } from '@/lib/db-types';
import { pct, padNumber } from '@/lib/format';

const accentClasses = {
  blueprint: {
    chip: 'bg-blueprint-500/10 text-blueprint-600',
    progress: 'bg-blueprint-600',
    glow: 'from-blueprint-700/40',
  },
  brass: {
    chip: 'bg-brass-500/10 text-brass-600',
    progress: 'bg-brass-500',
    glow: 'from-brass-600/30',
  },
  signal: {
    chip: 'bg-signal-500/10 text-signal-600',
    progress: 'bg-signal-500',
    glow: 'from-signal-600/30',
  },
  moss: {
    chip: 'bg-moss-500/10 text-moss-600',
    progress: 'bg-moss-500',
    glow: 'from-moss-600/30',
  },
} as const;

const skillAccentMap: Record<string, keyof typeof accentClasses> = {
  Engineering: 'blueprint',
  Data: 'brass',
  Design: 'signal',
  Strategy: 'moss',
};

interface ContinueLearningProps {
  course: CourseWithDetails | null;
  lessons: LessonWithSection[];
  progress: UserLessonProgressRow[];
}

export function ContinueLearning({ course, lessons, progress }: ContinueLearningProps) {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);

  if (!course || lessons.length === 0) {
    return (
      <section className="animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow-ink">01 / Continue Learning</span>
        </div>
        <div className="bg-paper-50 rounded-xl shadow-panel p-12 text-center">
          <Layers className="w-8 h-8 text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[13px] text-ink-400">No courses available yet. Check back soon.</p>
        </div>
      </section>
    );
  }

  const skillName = course.skill?.name ?? 'General';
  const accent = skillAccentMap[skillName] ?? 'blueprint';
  const a = accentClasses[accent];

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );
  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPct = pct(completedCount, lessons.length);

  // Find current lesson = first uncompleted
  const currentLesson = lessons.find((l) => !completedLessonIds.has(l.id));
  const totalXp = lessons.reduce((sum, l) => sum + l.xp_reward, 0);

  return (
    <section className="animate-fade-up" style={{ animationDelay: '80ms' }}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="eyebrow-ink">01 / Continue Learning</span>
        </div>
        <button className="focus-ring text-[11px] font-medium text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-0.5">
          View all paths <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="bg-paper-50 rounded-xl shadow-panel overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          {/* Left: Course context */}
          <div className="relative p-6 lg:p-8 overflow-hidden">
            <div className="absolute inset-0 blueprint-grid opacity-40" />
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-b ${a.glow} to-transparent blur-3xl opacity-50`} />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-mono uppercase tracking-eyebrow font-medium px-2 py-0.5 rounded ${a.chip}`}>
                  {skillName}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-eyebrow text-ink-400">
                  {course.level}
                </span>
              </div>

              <h2 className="font-display text-display-sm text-ink-900 tracking-tightish text-balance mb-2">
                {course.title}
              </h2>
              <p className="text-[14px] text-ink-500 leading-relaxed mb-5 max-w-md">
                {course.description}
              </p>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="eyebrow">Course Progress</span>
                  <span className="font-mono text-[12px] text-ink-700 font-medium tabular-nums">
                    {padNumber(completedCount)}/{padNumber(lessons.length)} lessons · {progressPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-ink-900/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${a.progress} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Stats inline */}
              <div className="flex items-center gap-5 mb-6">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-ink-400" strokeWidth={2} />
                  <span className="font-mono text-[12px] text-ink-600 tabular-nums">
                    {lessons.length - completedCount} left
                  </span>
                </div>
                <div className="hairline-r h-3.5" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brass-500" strokeWidth={2} />
                  <span className="font-mono text-[12px] text-ink-600 tabular-nums">+{totalXp} XP total</span>
                </div>
              </div>

              {/* CTA */}
              <button className="focus-ring group inline-flex items-center gap-2.5 px-5 py-3 bg-ink-900 text-paper-100 rounded-lg font-medium text-[13px] hover:bg-ink-800 transition-all duration-200 shadow-lifted hover:scale-[1.01] active:scale-[0.99]">
                <Play className="w-4 h-4 fill-paper-100 text-paper-100 group-hover:translate-x-0.5 transition-transform" strokeWidth={0} />
                {currentLesson ? `Resume: ${currentLesson.title}` : 'Start Course'}
                <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Right: Lesson list */}
          <div className="lg:hairline-r border-t lg:border-t-0 bg-paper-100/50">
            <div className="px-6 lg:px-7 pt-6 pb-2 flex items-baseline justify-between">
              <span className="eyebrow-ink">Up Next in This Path</span>
              <span className="font-mono text-[10px] text-ink-400">{lessons.length} lessons</span>
            </div>
            <div className="px-3 pb-4">
              {lessons.map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isCurrent = currentLesson?.id === lesson.id;
                const isHovered = hoveredLesson === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onMouseEnter={() => setHoveredLesson(lesson.id)}
                    onMouseLeave={() => setHoveredLesson(null)}
                    className={`focus-ring w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-200 ${
                      isCurrent
                        ? 'bg-ink-900/4'
                        : isHovered
                        ? 'bg-ink-900/3'
                        : ''
                    }`}
                  >
                    <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-moss-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-paper-50" strokeWidth={3} />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blueprint-600 flex items-center justify-center relative">
                          <div className="w-2 h-2 rounded-full bg-blueprint-600 animate-pulse-soft" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-ink-200" strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] truncate ${
                          isCompleted
                            ? 'text-ink-400 line-through decoration-ink-200'
                            : isCurrent
                            ? 'text-ink-900 font-medium'
                            : 'text-ink-700'
                        }`}
                      >
                        {lesson.title}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-400 tabular-nums">
                        +{lesson.xp_reward} XP
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono uppercase tracking-eyebrow text-blueprint-600 font-medium bg-blueprint-500/10 px-1.5 py-0.5 rounded">
                          Now
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer skill chips */}
            <div className="hairline mx-3" />
            <div className="px-6 py-4 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-ink-900/5 text-ink-500">
                {skillName}
              </span>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-ink-900/5 text-ink-500">
                {course.level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
