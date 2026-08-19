import { useState } from 'react';
import { Zap, ArrowUpRight, BarChart3, Layers } from 'lucide-react';
import type { CourseWithDetails, UserLessonProgressRow } from '@/lib/db-types';
import { pct, padNumber } from '@/lib/format';

const accentClasses = {
  blueprint: { bar: 'bg-blueprint-600', chip: 'text-blueprint-600 bg-blueprint-500/10', glow: 'from-blueprint-700/30' },
  brass: { bar: 'bg-brass-500', chip: 'text-brass-600 bg-brass-500/10', glow: 'from-brass-600/30' },
  signal: { bar: 'bg-signal-500', chip: 'text-signal-600 bg-signal-500/10', glow: 'from-signal-600/30' },
  moss: { bar: 'bg-moss-500', chip: 'text-moss-600 bg-moss-500/10', glow: 'from-moss-600/30' },
} as const;

const skillAccentMap: Record<string, keyof typeof accentClasses> = {
  Engineering: 'blueprint',
  Data: 'brass',
  Design: 'signal',
  Strategy: 'moss',
};

interface CourseCardProps {
  course: CourseWithDetails;
  index: number;
  completedLessonIds: Set<string>;
}

function CourseCard({ course, index, completedLessonIds }: CourseCardProps) {
  const skillName = course.skill?.name ?? 'General';
  const accent = skillAccentMap[skillName] ?? 'blueprint';
  const a = accentClasses[accent];

  // We don't have lesson counts directly on the course — estimate from sections
  const sectionCount = course.course_sections?.length ?? 0;
  const isStarted = course.course_sections?.some((s) =>
    completedLessonIds.size > 0
  ) ?? false;

  return (
    <button
      className="focus-ring group text-left bg-paper-50 rounded-xl shadow-panel hover:shadow-lifted transition-all duration-300 overflow-hidden animate-fade-up hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Cover strip */}
      <div className="relative h-24 overflow-hidden hairline-b">
        <div className="absolute inset-0 blueprint-grid opacity-50" />
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-b ${a.glow} to-transparent blur-2xl opacity-60`} />
        <div className="absolute inset-0 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-eyebrow font-medium px-2 py-0.5 rounded ${a.chip}`}>
              {skillName}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-eyebrow text-ink-400">
              {course.level}
            </span>
          </div>
          <div className="w-8 h-8 rounded-md bg-ink-900/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowUpRight className="w-4 h-4 text-ink-700" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-[15px] font-semibold text-ink-900 tracking-tightish mb-1.5 text-balance group-hover:text-ink-800 transition-colors">
          {course.title}
        </h3>
        <p className="text-[12px] text-ink-500 leading-relaxed mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-ink-400" strokeWidth={2} />
            <span className="font-mono text-[11px] text-ink-500 tabular-nums">
              {sectionCount} sections
            </span>
          </div>
          <div className="hairline-r h-3" />
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-ink-400" strokeWidth={2} />
            <span className="font-mono text-[11px] text-ink-500 tabular-nums">
              {course.level}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-ink-400">
            {isStarted ? 'In progress' : 'Not started'}
          </span>
          <span className="text-[11px] font-medium text-ink-700 group-hover:text-blueprint-600 transition-colors flex items-center gap-0.5">
            {isStarted ? 'Continue' : 'Begin'} <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

interface SkillPathsProps {
  courses: CourseWithDetails[];
  progress: UserLessonProgressRow[];
}

export function SkillPaths({ courses, progress }: SkillPathsProps) {
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...new Set(courses.map((c) => c.skill?.name).filter(Boolean))] as string[];
  const filtered = filter === 'All' ? courses : courses.filter((c) => c.skill?.name === filter);
  const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  return (
    <section className="animate-fade-up" style={{ animationDelay: '160ms' }}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="eyebrow-ink">02 / Skill Paths</span>
          <h2 className="font-display text-display-sm text-ink-900 tracking-tightish mt-1">
            Browse the Atelier
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`focus-ring shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-md transition-all duration-200 ${
              filter === cat
                ? 'bg-ink-900 text-paper-100'
                : 'text-ink-500 hover:text-ink-900 hover:bg-ink-900/5'
            }`}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto shrink-0 pl-3">
          <span className="font-mono text-[11px] text-ink-400 tabular-nums">{filtered.length} paths</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} completedLessonIds={completedLessonIds} />
        ))}
      </div>
    </section>
  );
}
